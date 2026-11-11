import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getTodayInBoston, validateReportInput } from "./reportValidation";
import "./ReportForm.css";

function ReportForm({ initialReport = null, onSave, onCancel }) {
  const formId = useId();
  const visitDateRef = useRef(null);
  const descriptionRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const savingRef = useRef(false);

  const [fields, setFields] = useState({
    visitDate: initialReport?.visitDate ?? "",
    description: initialReport?.description ?? "",
  });
  const [maximumDate, setMaximumDate] = useState(getTodayInBoston);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({
    errors: {},
    message: "",
    focus: null,
  });

  const isEditing = initialReport !== null;

  useEffect(() => {
    visitDateRef.current?.focus();
  }, []);

  useEffect(() => {
    if (feedback.focus === "visitDate") {
      visitDateRef.current?.focus();
    } else if (feedback.focus === "description") {
      descriptionRef.current?.focus();
    } else if (feedback.focus === "summary") {
      errorSummaryRef.current?.focus();
    }
  }, [feedback]);

  function showFeedback(errors, message) {
    setFeedback({
      errors,
      message: errors.form || message,
      focus: errors.visitDate
        ? "visitDate"
        : errors.description
          ? "description"
          : "summary",
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFields((current) => ({
      ...current,
      [name]: value,
    }));

    // Clear this field's previous error while the user corrects it.
    setFeedback((current) => ({
      errors: {
        ...current.errors,
        [name]: undefined,
      },
      message: "",
      focus: null,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent repeated submissions while a save is running.
    if (savingRef.current) {
      return;
    }

    const { errors, value } = validateReportInput(fields);

    if (!value) {
      showFeedback(errors, "Check the highlighted fields.");
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setFeedback({ errors: {}, message: "", focus: null });

    try {
      // Submit only the two validated, editable fields.
      await onSave(value);
    } catch (error) {
      showFeedback(
        error?.fieldErrors ?? {},
        error?.message || "Could not save your report. Please try again.",
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form
      className="report-form"
      aria-labelledby={`${formId}-title`}
      onSubmit={handleSubmit}
      noValidate
    >
      {feedback.message && (
        <p
          className="report-form__error-summary"
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
        >
          {feedback.message}
        </p>
      )}

      <fieldset className="report-form__fields" disabled={isSaving}>
        <legend id={`${formId}-title`}>
          {isEditing ? "Edit your report" : "Share an observation"}
        </legend>

        <p className="report-form__help">Both fields are required.</p>

        <div className="report-form__field">
          <label htmlFor={`${formId}-visit-date`}>Visit date</label>

          <input
            ref={visitDateRef}
            id={`${formId}-visit-date`}
            name="visitDate"
            type="date"
            value={fields.visitDate}
            max={maximumDate}
            required
            onChange={handleChange}
            onFocus={() => setMaximumDate(getTodayInBoston())}
            aria-invalid={Boolean(feedback.errors.visitDate)}
            aria-describedby={`${formId}-date-help${
              feedback.errors.visitDate ? ` ${formId}-date-error` : ""
            }`}
          />

          <p className="report-form__help" id={`${formId}-date-help`}>
            Choose today or an earlier date, based on Boston time.
          </p>

          {feedback.errors.visitDate && (
            <p className="report-form__error" id={`${formId}-date-error`}>
              {feedback.errors.visitDate}
            </p>
          )}
        </div>

        <div className="report-form__field">
          <label htmlFor={`${formId}-description`}>Your observation</label>

          <textarea
            ref={descriptionRef}
            id={`${formId}-description`}
            name="description"
            value={fields.description}
            rows={5}
            maxLength={1000}
            required
            onChange={handleChange}
            aria-invalid={Boolean(feedback.errors.description)}
            aria-describedby={`${formId}-description-help ${formId}-count${
              feedback.errors.description ? ` ${formId}-description-error` : ""
            }`}
          />

          <p className="report-form__help" id={`${formId}-description-help`}>
            Describe what you observed during your visit.
          </p>

          <p className="report-form__count" id={`${formId}-count`}>
            {fields.description.length.toLocaleString()} / 1,000 characters
          </p>

          {feedback.errors.description && (
            <p
              className="report-form__error"
              id={`${formId}-description-error`}
            >
              {feedback.errors.description}
            </p>
          )}
        </div>

        <div className="report-form__actions">
          <button
            className="report-form__button report-form__button--primary"
            type="submit"
          >
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Post report"}
          </button>

          <button
            className="report-form__button"
            type="button"
            onClick={() => {
              if (!savingRef.current) {
                onCancel();
              }
            }}
          >
            Cancel
          </button>
        </div>
      </fieldset>

      {isSaving && (
        <p className="report-form__help" role="status">
          Saving your report…
        </p>
      )}
    </form>
  );
}

ReportForm.propTypes = {
  initialReport: PropTypes.shape({
    visitDate: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ReportForm;
