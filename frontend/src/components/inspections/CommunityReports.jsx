import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createReport, fetchReports, updateReport } from "./api";
import ReportForm from "./ReportForm";
import "./CommunityReports.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function CommunityReports({ restaurantId }) {
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState({
    key: null,
    data: null,
    error: null,
  });
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const headingRef = useRef(null);
  const savingRef = useRef(false);

  const requestKey = `${restaurantId}:${attempt}`;
  const loading = response.key !== requestKey;
  const data = loading ? null : response.data;
  const error = loading ? null : response.error;

  const activeEditor = editor?.restaurantId === restaurantId ? editor : null;

  const reportCount = data?.reports.length ?? 0;
  const canWrite = Boolean(data?.currentUserId);
  const controlsDisabled = isSaving || Boolean(activeEditor);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      try {
        const data = await fetchReports(restaurantId, controller.signal);

        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data: null, error });
        }
      }
    }

    loadReports();

    return () => controller.abort();
  }, [restaurantId, requestKey]);

  function handleRefresh() {
    // Keep an open draft intact until it is saved or canceled.
    if (savingRef.current || activeEditor) {
      return;
    }

    setNotice("");
    headingRef.current?.focus();
    setAttempt((current) => current + 1);
  }

  function handleOpenEditor(report = null) {
    if (!canWrite || savingRef.current || activeEditor) {
      return;
    }

    if (report && report.authorId !== data.currentUserId) {
      return;
    }

    setNotice("");
    setEditor({ restaurantId, report });
  }

  function handleCancelEditor() {
    if (savingRef.current) {
      return;
    }

    setEditor(null);
    headingRef.current?.focus();
  }

  async function handleSave(values) {
    if (!activeEditor || !canWrite) {
      throw new Error("Sign in to save a community report.");
    }

    if (savingRef.current) {
      throw new Error("A report is already being saved.");
    }

    const reportToEdit = activeEditor.report;

    savingRef.current = true;
    setIsSaving(true);

    try {
      const { report: savedReport } = reportToEdit
        ? await updateReport(reportToEdit._id, values)
        : await createReport(restaurantId, values);

      // Use the saved record returned by the server.
      setResponse((current) => {
        if (current.key !== requestKey || !current.data) {
          return current;
        }

        const reports = reportToEdit
          ? current.data.reports.map((report) =>
              report._id === savedReport._id
                ? { ...report, ...savedReport }
                : report,
            )
          : [savedReport, ...current.data.reports];

        return {
          ...current,
          data: {
            ...current.data,
            reports,
          },
        };
      });

      setEditor(null);
      setNotice(
        reportToEdit ? "Your report was updated." : "Your report was posted.",
      );
      headingRef.current?.focus();
    } finally {
      // Errors reach ReportForm, which displays them and preserves input.
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <section
      className="community-reports"
      aria-labelledby="community-reports-title"
    >
      <header className="community-reports__header">
        <h3
          id="community-reports-title"
          className="community-reports__title"
          ref={headingRef}
          tabIndex={-1}
        >
          Community reports
        </h3>

        {data && (
          <div className="community-reports__actions">
            <p className="community-reports__count" role="status">
              {reportCount.toLocaleString("en-US")}{" "}
              {reportCount === 1 ? "report" : "reports"}
            </p>

            {canWrite && (
              <button
                className="community-reports__button"
                type="button"
                disabled={controlsDisabled}
                onClick={() => handleOpenEditor()}
              >
                Share an observation
              </button>
            )}

            <button
              className="community-reports__button"
              type="button"
              disabled={controlsDisabled}
              onClick={handleRefresh}
            >
              Refresh reports
            </button>
          </div>
        )}
      </header>

      <p className="community-reports__intro">
        Observations from restaurant visits, shown newest first.
      </p>

      {notice && (
        <p className="community-reports__notice" role="status">
          {notice}
        </p>
      )}

      {loading && <p role="status">Loading community reports...</p>}

      {error && (
        <div className="community-reports__error" role="alert">
          <p>
            {error.status === 404
              ? "Community reports are unavailable for this restaurant."
              : "Could not load community reports. Please try again."}
          </p>

          <button
            className="community-reports__button"
            type="button"
            onClick={handleRefresh}
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          {!canWrite && (
            <p className="community-reports__notice">
              Sign in to share an observation or manage your own reports.
            </p>
          )}

          {canWrite && activeEditor && (
            <ReportForm
              key={`${restaurantId}:${activeEditor.report?._id ?? "new"}`}
              initialReport={activeEditor.report}
              onSave={handleSave}
              onCancel={handleCancelEditor}
            />
          )}

          {reportCount === 0 ? (
            <p className="community-reports__empty">
              No community reports have been posted for this restaurant.
            </p>
          ) : (
            <ul className="community-reports__list">
              {data.reports.map((report) => (
                <li className="community-reports__report" key={report._id}>
                  <h4>
                    Visit on{" "}
                    <time dateTime={report.visitDate}>
                      {dateFormatter.format(new Date(report.visitDate))}
                    </time>
                  </h4>

                  <p className="community-reports__author">
                    {report.authorId === data.currentUserId
                      ? "You"
                      : report.authorName || "Community member"}
                  </p>

                  <p className="community-reports__description">
                    {report.description}
                  </p>

                  {canWrite && report.authorId === data.currentUserId && (
                    <div className="community-reports__report-actions">
                      <button
                        className="community-reports__button"
                        type="button"
                        disabled={controlsDisabled}
                        onClick={() => handleOpenEditor(report)}
                      >
                        Edit report
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

CommunityReports.propTypes = {
  restaurantId: PropTypes.string.isRequired,
};

export default CommunityReports;
