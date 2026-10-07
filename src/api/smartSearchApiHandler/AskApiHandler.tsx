import React from "react";
import { toast } from "sonner";
import { streamAsk } from "./AskBaseApiHandler";
import {
  AskAnswerEvent,
  AskEvent,
  AskObservationEvent,
  AskStepEvent,
} from "@/types/api/smartSearch.types";

interface AskState {
  steps: AskStepEvent[];
  observations: AskObservationEvent[];
  status: string | null;
  answer: AskAnswerEvent | null;
  error: string | null;
  isRunning: boolean;
}

const INITIAL_STATE: AskState = {
  steps: [],
  observations: [],
  status: null,
  answer: null,
  error: null,
  isRunning: false,
};

/**
 * Runs one Deep search question and collects the streamed agent events.
 * Not a react-query mutation: the result arrives in pieces, and the UI shows
 * each step as it lands.
 */
export const useAskStream = () => {
  const [state, setState] = React.useState<AskState>(INITIAL_STATE);
  const controllerRef = React.useRef<AbortController | null>(null);

  // Abort an in-flight question when the panel unmounts.
  React.useEffect(() => () => controllerRef.current?.abort(), []);

  const handleEvent = React.useCallback((event: AskEvent) => {
    setState((prev) => {
      switch (event.type) {
        case "status":
          return { ...prev, status: event.message };
        case "step":
          return { ...prev, status: null, steps: [...prev.steps, event] };
        case "observation":
          return { ...prev, observations: [...prev.observations, event] };
        case "answer":
          return { ...prev, answer: event };
        case "error":
          return { ...prev, error: event.message };
        default:
          return prev;
      }
    });
  }, []);

  const ask = React.useCallback(
    async (question: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ ...INITIAL_STATE, isRunning: true });

      try {
        await streamAsk({ question }, handleEvent, controller.signal);
        setState((prev) =>
          prev.answer || prev.error
            ? prev
            : { ...prev, error: "The search ended without an answer." }
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Deep search failed.";
        setState((prev) => ({ ...prev, error: message }));
        toast.error(message);
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setState((prev) => ({ ...prev, isRunning: false, status: null }));
        }
      }
    },
    [handleEvent]
  );

  const cancel = React.useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      status: null,
      error: prev.answer ? prev.error : "Stopped.",
    }));
  }, []);

  return { ...state, ask, cancel };
};
