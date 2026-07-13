"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { QUOTE_FORM_DEFAULTS, QUOTE_TRANSPORT_MODES } from "@/lib/constants";
import { initialQuoteFormState, submitQuoteForm, validateAll } from "@/lib/forms/quoteForm";
import type {
  QuoteFieldKey,
  QuoteFormConfig,
  QuoteFormErrors,
  QuoteFormPrefill,
  QuoteFormRoute,
  QuoteFormState,
  TransportMode,
} from "@/types/quoteForm";
import { Step01ModeOfTransport } from "./steps/Step01ModeOfTransport";
import { Step02RouteInformation } from "./steps/Step02RouteInformation";
import { Step03ShipmentDetails } from "./steps/Step03ShipmentDetails";
import { Step04TransactionDetails } from "./steps/Step04TransactionDetails";
import { Step05ContactCompany } from "./steps/Step05ContactCompany";
import { StepHeading, type StepStatus } from "./steps/StepHeading";
import { QuoteFormSuccess } from "./QuoteFormSuccess";
import { QuoteFormErrorBanner } from "./QuoteFormErrorBanner";
import { Spinner } from "@/components/icons/quote";

const TURNSTILE_TIMEOUT_MS = 8000;
const TURNSTILE_LOAD_TIMEOUT_MS = 6000;

export type QuoteFormCoreProps = {
  variant: "standalone" | "embedded";
  config: QuoteFormConfig | null;
  prefill?: QuoteFormPrefill;
};

type RouteIndex = number;

type SubmissionResult =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

// Derive per-step completion from `validateAll` so the heading icon and the
// submit-time error state can never disagree. (Previously this function
// duplicated a subset of the rules, which produced two bugs: step 5 showed a
// green tick for an invalid `companyWebsite` because the URL regex was only
// in `validateAll`; step 3 showed a red refresh when only `shippingPeriod`
// was filled because completion required the OPTIONAL helicopter brand/model.)
function stepCompletion(state: QuoteFormState): Record<1 | 2 | 3 | 4 | 5, boolean> {
  const errs = validateAll(state);
  const ok = (...keys: QuoteFieldKey[]) => keys.every((k) => !errs[k]);
  const routesOk = state.routes.every(
    (_, i) =>
      !errs[`routes.${i}.origin` as QuoteFieldKey] &&
      !errs[`routes.${i}.destination` as QuoteFieldKey],
  );
  return {
    1: ok("modes"),
    2: routesOk,
    3: ok(
      "shippingPeriod",
      "helicopterBrands",
      "helicopterModels",
      "helicopterQuantity",
      "transactionType",
    ),
    4: ok("additionalInformation"),
    5: ok("companyName", "companyWebsite", "fullName", "email"),
  };
}

export function QuoteFormCore({ variant, config, prefill }: QuoteFormCoreProps) {
  const isShell = variant === "embedded";
  // Per Figma `344:3275`, shell variant uses the natural 2-column desktop
  // layout for each step (origin+destination side-by-side, etc.) — NOT a
  // forced single-column stack. Mobile remains stacked via responsive Tailwind.
  const stackFields = false;
  const step04Label = "Additional Information";

  const [state, setState] = useState<QuoteFormState>(() => initialQuoteFormState(prefill));
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResult>({ kind: "idle" });
  // Mobile accordion: Steps 03/04/05 collapsed by default; auto-expand on previous-step complete.
  const [openSteps, setOpenSteps] = useState<Set<1 | 2 | 3 | 4 | 5>>(() => new Set([1, 2]));
  const prevCompletion = useRef(stepCompletion(state));
  const formRef = useRef<HTMLFormElement | null>(null);

  // Cloudflare Turnstile widget lifecycle. With an invisible widget, the
  // dashboard config controls visibility and the widget auto-fires its
  // callback on render. We cache the most-recent token in a ref; on submit
  // we return it immediately (or wait briefly for it to arrive). After a
  // successful submission, the widget is reset() to issue a fresh token.
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<{
    resolve: (token: string) => void;
    reject: (reason: Error) => void;
  } | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    let cancelled = false;
    const start = Date.now();

    const mount = () => {
      if (cancelled) return;
      const api = window.turnstile;
      const container = turnstileContainerRef.current;
      if (!api || !container) {
        if (Date.now() - start < TURNSTILE_LOAD_TIMEOUT_MS) {
          window.setTimeout(mount, 150);
        }
        return;
      }
      // Guard against React StrictMode double-mount: if a widget already
      // exists for this component, leave it alone.
      if (turnstileWidgetId.current) return;
      try {
        turnstileWidgetId.current = api.render(container, {
          sitekey: siteKey,
          // Invisible widget mode is configured in the Cloudflare dashboard
          // when the site is created. No `size` param is passed (the API
          // rejects `size: "invisible"`). The widget auto-fires its callback
          // shortly after render — we cache the token in `turnstileTokenRef`.
          action: "quote_submit",
          callback: (token: string) => {
            turnstileTokenRef.current = token;
            tokenResolverRef.current?.resolve(token);
            tokenResolverRef.current = null;
          },
          "error-callback": (code?: string) => {
            console.warn("[Turnstile] error-callback", code);
            tokenResolverRef.current?.reject(new Error(code ?? "turnstile-error"));
            tokenResolverRef.current = null;
            // Reset so the widget recovers for the next attempt (otherwise
            // it gets stuck in the error state and every retry re-fails).
            try {
              window.turnstile?.reset(turnstileWidgetId.current ?? undefined);
            } catch {
              /* ignore */
            }
            turnstileTokenRef.current = null;
          },
          "expired-callback": () => {
            turnstileTokenRef.current = null;
          },
          "timeout-callback": () => {
            turnstileTokenRef.current = null;
            tokenResolverRef.current?.reject(new Error("turnstile-timeout"));
            tokenResolverRef.current = null;
          },
          retry: "auto",
        });
      } catch (err) {
        console.error("[Turnstile] render failed", err);
      }
    };
    mount();

    return () => {
      cancelled = true;
      const api = window.turnstile;
      if (api && turnstileWidgetId.current) {
        try {
          api.remove(turnstileWidgetId.current);
        } catch {
          /* ignore */
        }
      }
      turnstileWidgetId.current = null;
      turnstileTokenRef.current = null;
      tokenResolverRef.current = null;
    };
  }, []);

  const requestTurnstileToken = useCallback((): Promise<string> => {
    const api = typeof window !== "undefined" ? window.turnstile : undefined;
    if (!api || !turnstileWidgetId.current) {
      return Promise.reject(new Error("turnstile-not-ready"));
    }
    // Reuse a previously-issued token if Cloudflare auto-fired one during
    // render (some site configs do, e.g. the test sitekey).
    const cached = turnstileTokenRef.current || api.getResponse?.(turnstileWidgetId.current);
    if (cached) return Promise.resolve(cached);

    return new Promise<string>((resolve, reject) => {
      tokenResolverRef.current = { resolve, reject };
      // Invisible widgets require an explicit `execute()` to trigger the
      // challenge; the token arrives in the callback set up at render time.
      try {
        api.execute(turnstileWidgetId.current!);
      } catch (err) {
        tokenResolverRef.current = null;
        reject(err instanceof Error ? err : new Error("turnstile-execute-failed"));
        return;
      }
      window.setTimeout(() => {
        if (tokenResolverRef.current) {
          tokenResolverRef.current.reject(new Error("turnstile-timeout"));
          tokenResolverRef.current = null;
        }
      }, TURNSTILE_TIMEOUT_MS);
    });
  }, []);

  // Listen for the cross-component prefill event (showcase modal → on-page form).
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<QuoteFormPrefill>).detail;
      if (!detail) return;
      // Drop invalid mode values defensively — the showcase modal maps tile
      // labels to canonical values, but a stray free-text dispatch shouldn't
      // corrupt the form state.
      const validModes =
        detail.modes && detail.modes.length > 0
          ? detail.modes.filter((m) => (QUOTE_TRANSPORT_MODES as readonly string[]).includes(m))
          : undefined;
      setState((prev) => ({
        ...prev,
        ...(validModes && validModes.length > 0 ? { modes: validModes } : {}),
        ...(detail.routes && detail.routes.length > 0
          ? {
              routes: [
                {
                  origin: detail.routes[0]?.origin ?? prev.routes[0]?.origin ?? "",
                  destination: detail.routes[0]?.destination ?? prev.routes[0]?.destination ?? "",
                },
                ...prev.routes.slice(1),
              ],
            }
          : {}),
        ...(detail.companyName ? { companyName: detail.companyName } : {}),
        ...(detail.email ? { email: detail.email } : {}),
      }));
    };
    window.addEventListener("hsc:quote-prefill", handler);
    return () => window.removeEventListener("hsc:quote-prefill", handler);
  }, []);

  // Auto-expand: when step N transitions to complete, expand step N+1.
  // Capture `previous` BEFORE setOpenSteps — the setState updater is queued
  // and would otherwise read the already-mutated ref.
  useEffect(() => {
    const current = stepCompletion(state);
    const previous = prevCompletion.current;
    const transitions: (1 | 2 | 3 | 4 | 5)[] = [];
    ([1, 2, 3, 4] as const).forEach((n) => {
      if (current[n] && !previous[n]) {
        transitions.push((n + 1) as 1 | 2 | 3 | 4 | 5);
      }
    });
    prevCompletion.current = current;
    if (transitions.length > 0) {
      setOpenSteps((prev) => {
        const next = new Set(prev);
        for (const step of transitions) next.add(step);
        return next;
      });
    }
  }, [state]);

  const completion = useMemo(() => stepCompletion(state), [state]);

  /**
   * Per-step "touched" — true when the user has interacted with at least one
   * field in that step (typed text, picked a dropdown value, attached a file).
   * Drives the heading indicator:
   *   - untouched          → no icon
   *   - touched + valid    → green tick
   *   - touched + invalid  → red refresh
   *
   * Step 01 has no default selection, so it follows the same pattern as the
   * other steps — touched once the customer picks a mode.
   */
  const touchedSteps = useMemo(
    () => ({
      1: state.modes.length > 0,
      2: state.routes.some((r) => r.origin.length > 0 || r.destination.length > 0),
      3:
        state.shippingPeriod.length > 0 ||
        state.helicopterBrands.length > 0 ||
        state.helicopterModels.length > 0 ||
        state.transactionType !== null,
      4: state.additionalInformation.length > 0,
      5:
        state.companyName.length > 0 ||
        state.companyWebsite.length > 0 ||
        state.fullName.length > 0 ||
        state.email.length > 0,
    }),
    [
      state.modes,
      state.routes,
      state.shippingPeriod,
      state.helicopterBrands,
      state.helicopterModels,
      state.transactionType,
      state.additionalInformation,
      state.companyName,
      state.companyWebsite,
      state.fullName,
      state.email,
    ],
  );

  const statusFor = useCallback(
    (step: 1 | 2 | 3 | 4 | 5): StepStatus => {
      if (!touchedSteps[step]) return "idle";
      return completion[step] ? "complete" : "active";
    },
    [completion, touchedSteps],
  );

  const updateState = useCallback((patch: Partial<QuoteFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const cleared = { ...prev };
      let dirty = false;
      for (const key of Object.keys(patch)) {
        if (cleared[key as QuoteFieldKey]) {
          delete cleared[key as QuoteFieldKey];
          dirty = true;
        }
      }
      return dirty ? cleared : prev;
    });
  }, []);

  const updateRoute = useCallback((index: RouteIndex, route: QuoteFormRoute) => {
    setState((prev) => {
      const next = prev.routes.map((r, i) => (i === index ? route : r));
      return { ...prev, routes: next };
    });
    setErrors((prev) => {
      const originKey = `routes.${index}.origin` as QuoteFieldKey;
      const destKey = `routes.${index}.destination` as QuoteFieldKey;
      if (!prev[originKey] && !prev[destKey]) return prev;
      const cleared = { ...prev };
      delete cleared[originKey];
      delete cleared[destKey];
      return cleared;
    });
  }, []);

  const addRoute = useCallback(() => {
    setState((prev) =>
      prev.routes.length < 5
        ? { ...prev, routes: [...prev.routes, { origin: "", destination: "" }] }
        : prev,
    );
  }, []);

  const removeRoute = useCallback((index: RouteIndex) => {
    setState((prev) => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleStep = useCallback((step: 1 | 2 | 3 | 4 | 5) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialQuoteFormState(prefill));
    setErrors({});
    setSubmission({ kind: "idle" });
    setOpenSteps(new Set([1, 2]));
  }, [prefill]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validation = validateAll(state);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        // Open any collapsed step on mobile that has errors.
        setOpenSteps((prev) => {
          const next = new Set(prev);
          if (
            validation.shippingPeriod ||
            validation.helicopterBrands ||
            validation.helicopterModels ||
            validation.helicopterQuantity ||
            validation.transactionType
          )
            next.add(3);
          if (validation.additionalInformation) next.add(4);
          if (
            validation.companyName ||
            validation.companyWebsite ||
            validation.fullName ||
            validation.email
          )
            next.add(5);
          return next;
        });
        // Focus first error. Step 01 renders both a mobile and a desktop
        // variant in the DOM at once (CSS-only responsive switching), so
        // prefer whichever match is actually visible at the current viewport.
        const firstKey = Object.keys(validation)[0];
        if (firstKey && formRef.current) {
          const candidates = formRef.current.querySelectorAll<HTMLElement>(
            `[aria-invalid="true"], [data-field="${firstKey}"], [name="${firstKey}"]`,
          );
          const target =
            Array.from(candidates).find((el) => el.offsetParent !== null) ?? candidates[0];
          target?.focus();
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      setSubmitting(true);
      let token = "";
      try {
        token = await requestTurnstileToken();
      } catch {
        setSubmitting(false);
        setSubmission({
          kind: "error",
          message:
            "We couldn't verify your browser. Please refresh the page and submit again — if the issue persists, email info@heliskycargo.com directly.",
        });
        return;
      }
      const result = await submitQuoteForm(state, config, token);
      setSubmitting(false);
      // Reset Turnstile so the next submission gets a fresh token (tokens are
      // single-use; reset() also clears the cached value).
      try {
        window.turnstile?.reset(turnstileWidgetId.current ?? undefined);
      } catch {
        /* ignore */
      }
      turnstileTokenRef.current = null;
      if (result.ok) {
        setSubmission({ kind: "success", message: result.message });
        setErrors({});
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setSubmission({ kind: "error", message: result.error });
        if (result.field) setErrors({ [result.field]: result.error });
      }
    },
    [state, config, requestTurnstileToken],
  );

  if (submission.kind === "success") {
    return <QuoteFormSuccess message={submission.message} onReset={reset} />;
  }

  // Accordion behavior:
  //   - Standalone /quote: Steps 01+02 always expanded (no toggle). Steps
  //     03/04/05 collapse on mobile only; desktop renders them expanded.
  //   - Embedded shell: ALL 5 steps are collapsible at every breakpoint (the
  //     M3 photo column needs the right column to stay compact). Steps 01+02
  //     start open by default; user can toggle any step.
  const accordionEverywhere = variant === "embedded";
  const isCollapsed = (step: 1 | 2 | 3 | 4 | 5) => !openSteps.has(step);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Request a quote"
      className={cn(
        "flex flex-col",
        variant === "standalone" ? "gap-[28px] lg:gap-[32px]" : "gap-[24px]",
      )}
    >
      {submission.kind === "error" ? (
        <QuoteFormErrorBanner
          message={submission.message}
          onDismiss={() => setSubmission({ kind: "idle" })}
        />
      ) : null}

      {/* Step 01 — Mode of Transport.
          Embedded variant: collapsible (matches Steps 03/04/05 treatment).
          Standalone: always-expanded plain section. */}
      {accordionEverywhere ? (
        <CollapsibleSection
          number="01"
          label="Mode of Transport"
          status={statusFor(1)}
          collapsed={isCollapsed(1)}
          desktopAccordion
          onToggle={() => toggleStep(1)}
          controlsId="step-01-body"
        >
          <Step01ModeOfTransport
            values={state.modes}
            onChange={(modes: TransportMode[]) => updateState({ modes })}
            desktopLayout={isShell ? "two-rows" : "single-row"}
            variant={isShell ? "shell" : "standalone"}
            error={errors.modes}
          />
        </CollapsibleSection>
      ) : (
        <section aria-labelledby="step-01" className="flex flex-col gap-[20px]">
          <div id="step-01">
            <StepHeading number="01" label="Mode of Transport" status={statusFor(1)} />
          </div>
          <Step01ModeOfTransport
            values={state.modes}
            onChange={(modes: TransportMode[]) => updateState({ modes })}
            desktopLayout={isShell ? "two-rows" : "single-row"}
            variant={isShell ? "shell" : "standalone"}
            error={errors.modes}
          />
        </section>
      )}

      {/* Step 02 — Route Information.
          Embedded variant: collapsible. Standalone: always-expanded. */}
      {accordionEverywhere ? (
        <CollapsibleSection
          number="02"
          label="Route Information"
          status={statusFor(2)}
          collapsed={isCollapsed(2)}
          desktopAccordion
          onToggle={() => toggleStep(2)}
          controlsId="step-02-body"
        >
          <Step02RouteInformation
            routes={state.routes}
            onChangeRoute={updateRoute}
            onAddRoute={addRoute}
            onRemoveRoute={removeRoute}
            errors={errors}
            stackFields={stackFields}
            hideMultiRoute={false}
          />
        </CollapsibleSection>
      ) : (
        <section aria-labelledby="step-02" className="flex flex-col gap-[20px]">
          <div
            id="step-02"
            className="border-input-border border-t border-dotted pt-[20px] lg:border-t-0 lg:pt-0"
          >
            <StepHeading number="02" label="Route Information" status={statusFor(2)} />
          </div>
          <Step02RouteInformation
            routes={state.routes}
            onChangeRoute={updateRoute}
            onAddRoute={addRoute}
            onRemoveRoute={removeRoute}
            errors={errors}
            stackFields={stackFields}
            hideMultiRoute={false}
          />
        </section>
      )}

      {/* Step 03 — Shipment Details (mobile accordion) */}
      <CollapsibleSection
        number="03"
        label="Shipment Details"
        status={statusFor(3)}
        collapsed={isCollapsed(3)}
        desktopAccordion={accordionEverywhere}
        onToggle={() => toggleStep(3)}
        controlsId="step-03-body"
      >
        <Step03ShipmentDetails
          state={state}
          onChange={updateState}
          errors={errors}
          stackFields={stackFields}
          compactRow={isShell}
        />
      </CollapsibleSection>

      {/* Step 04 — Transaction Details / Classification.
          Shell uses "Transaction Classification" label per Figma `344:3275`. */}
      <CollapsibleSection
        number="04"
        label={step04Label}
        status={statusFor(4)}
        collapsed={isCollapsed(4)}
        desktopAccordion={accordionEverywhere}
        onToggle={() => toggleStep(4)}
        controlsId="step-04-body"
      >
        <Step04TransactionDetails
          state={state}
          onChange={updateState}
          errors={errors}
          stackFields={stackFields}
          variant={isShell ? "shell" : "standalone"}
        />
      </CollapsibleSection>

      {/* Step 05 — Contact & Company (mobile accordion) */}
      <CollapsibleSection
        number="05"
        label="Contact & Company"
        status={statusFor(5)}
        collapsed={isCollapsed(5)}
        desktopAccordion={accordionEverywhere}
        onToggle={() => toggleStep(5)}
        controlsId="step-05-body"
      >
        <Step05ContactCompany
          state={state}
          onChange={updateState}
          errors={errors}
          stackFields={stackFields}
        />
      </CollapsibleSection>

      {/* Submit + disclaimer */}
      <div
        className={cn(
          "mt-[12px] flex flex-col gap-[14px]",
          variant === "standalone" ? "lg:flex-row lg:items-center lg:gap-[24px]" : "",
        )}
      >
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          aria-disabled={submitting || undefined}
          className={cn(
            "font-body inline-flex h-[56px] items-center justify-center px-[30px] text-[14px] font-bold tracking-[0.04em] capitalize transition-colors lg:text-[15px]",
            "bg-ink text-surface hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-60",
            variant === "standalone" ? "w-full lg:w-[510px]" : "w-full",
          )}
        >
          {submitting ? (
            <>
              <Spinner className="text-surface mr-[10px] size-[16px] animate-spin" />
              {QUOTE_FORM_DEFAULTS.submittingLabel}
            </>
          ) : (
            QUOTE_FORM_DEFAULTS.submitLabel
          )}
        </button>
        <div
          className={cn(
            "flex flex-col gap-[6px]",
            variant === "standalone" ? "lg:ml-auto lg:items-end" : "",
          )}
        >
          <p
            className={cn(
              "font-body text-ink text-[10px] tracking-[0.04em] uppercase",
              variant === "standalone" ? "text-center lg:text-right" : "text-left",
            )}
          >
            {QUOTE_FORM_DEFAULTS.disclaimer}
          </p>
        </div>
      </div>

      {/* Turnstile widget container. With the Cloudflare dashboard set to
          Invisible mode this renders nothing visible (just a hidden input);
          if you ever switch the dashboard to Managed / Non-interactive the
          challenge can still render inside this div — it's not display:none. */}
      <div ref={turnstileContainerRef} aria-hidden="true" className="h-0 overflow-hidden" />
    </form>
  );
}

type CollapsibleSectionProps = {
  number: string;
  label: string;
  status: StepStatus;
  collapsed: boolean;
  onToggle: () => void;
  controlsId: string;
  /**
   * When true, the accordion behavior applies at every breakpoint (used by the
   * embedded `QuoteFormShell` so the right column stays compact under the M3
   * photo). When false (standalone /quote), desktop renders the body
   * unconditionally and only mobile collapses.
   */
  desktopAccordion?: boolean;
  children: React.ReactNode;
};

function CollapsibleSection({
  number,
  label,
  status,
  collapsed,
  onToggle,
  controlsId,
  desktopAccordion,
  children,
}: CollapsibleSectionProps) {
  return (
    <section aria-labelledby={controlsId} className="flex flex-col gap-[20px]">
      <div
        className={
          desktopAccordion
            ? "border-input-border border-t border-dotted pt-[20px]"
            : "border-input-border border-t border-dotted pt-[20px] lg:border-t-0 lg:pt-0"
        }
      >
        <StepHeading
          number={number}
          label={label}
          status={status}
          onToggle={onToggle}
          expanded={!collapsed}
          showChevronOnDesktop={desktopAccordion}
          controlsId={controlsId}
        />
      </div>
      <div
        id={controlsId}
        className={cn(
          "flex flex-col gap-[20px]",
          desktopAccordion
            ? collapsed
              ? "hidden"
              : ""
            : cn("lg:block", collapsed ? "hidden lg:block" : ""),
        )}
      >
        {children}
      </div>
    </section>
  );
}
