import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createReport, deleteReport, fetchReports, updateReport } from "./api";
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
  const [deletion, setDeletion] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [notice, setNotice] = useState("");

  const headingRef = useRef(null);
  const mutationRef = useRef(false);
  const deleteTriggerRef = useRef(null);
  const cancelDeleteRef = useRef(null);
  const deleteErrorRef = useRef(null);

  const requestKey = `${restaurantId}:${attempt}`;
  const loading = response.key !== requestKey;
  const data = loading ? null : response.data;
  const error = loading ? null : response.error;

  const activeEditor = editor?.restaurantId === restaurantId ? editor : null;

  const activeDeletion =
    deletion?.restaurantId === restaurantId ? deletion : null;

  const reportCount = data?.reports.length ?? 0;
  const canWrite = Boolean(data?.currentUserId);
  const controlsDisabled =
    isMutating || Boolean(activeEditor) || Boolean(activeDeletion);

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

  useEffect(() => {
    if (activeDeletion) {
      if (!isMutating) {
        if (deleteError) {
          deleteErrorRef.current?.focus();
        } else {
          cancelDeleteRef.current?.focus();
        }
      }

      return;
    }

    // Restore the trigger after cancellation, or the heading after deletion.
    const trigger = deleteTriggerRef.current;

    if (trigger) {
      if (trigger.isConnected) {
        trigger.focus();
      } else {
        headingRef.current?.focus();
      }

      deleteTriggerRef.current = null;
    }
  }, [activeDeletion, isMutating, deleteError]);

  function handleRefresh() {
    if (mutationRef.current || activeEditor || activeDeletion) {
      return;
    }

    setNotice("");
    headingRef.current?.focus();
    setAttempt((current) => current + 1);
  }

  function handleOpenEditor(report = null) {
    if (!canWrite || mutationRef.current || activeEditor || activeDeletion) {
      return;
    }

    if (report && report.authorId !== data.currentUserId) {
      return;
    }

    setNotice("");
    setEditor({ restaurantId, report });
  }

  function handleCancelEditor() {
    if (mutationRef.current) {
      return;
    }

    setEditor(null);
    headingRef.current?.focus();
  }

  async function handleSave(values) {
    if (!activeEditor || !canWrite) {
      throw new Error("Sign in to save a community report.");
    }

    if (mutationRef.current) {
      throw new Error("Another report action is already running.");
    }

    const reportToEdit = activeEditor.report;

    mutationRef.current = true;
    setIsMutating(true);

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
      // Save errors reach ReportForm without discarding its inputs.
      mutationRef.current = false;
      setIsMutating(false);
    }
  }

  function handleRequestDelete(report, trigger) {
    if (
      !canWrite ||
      mutationRef.current ||
      activeEditor ||
      activeDeletion ||
      report.authorId !== data.currentUserId
    ) {
      return;
    }

    deleteTriggerRef.current = trigger;
    setNotice("");
    setDeleteError("");
    setDeletion({ restaurantId, reportId: report._id });
  }

  function handleCancelDelete() {
    if (mutationRef.current) {
      return;
    }

    setDeleteError("");
    setDeletion(null);
  }

  async function handleConfirmDelete() {
    if (!activeDeletion || !canWrite || mutationRef.current) {
      return;
    }

    const { reportId } = activeDeletion;

    mutationRef.current = true;
    setIsMutating(true);
    setDeleteError("");

    try {
      await deleteReport(reportId);

      // Remove the card only after the DELETE request succeeds.
      setResponse((current) => {
        if (current.key !== requestKey || !current.data) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            reports: current.data.reports.filter(
              (report) => report._id !== reportId,
            ),
          },
        };
      });

      setDeletion(null);
      setNotice("Your report was deleted.");
    } catch (error) {
      if (error.status === 401) {
        setDeleteError("Sign in again to delete this report.");
      } else if (error.status === 404) {
        setDeleteError(
          "This report is no longer available. Cancel and refresh the reports.",
        );
      } else {
        setDeleteError(
          "Could not confirm deletion. Try again, or cancel and refresh the reports.",
        );
      }
    } finally {
      mutationRef.current = false;
      setIsMutating(false);
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
                    <>
                      <div className="community-reports__report-actions">
                        <button
                          className="community-reports__button"
                          type="button"
                          disabled={controlsDisabled}
                          onClick={() => handleOpenEditor(report)}
                        >
                          Edit report
                        </button>

                        <button
                          className="community-reports__button"
                          type="button"
                          disabled={controlsDisabled}
                          aria-expanded={
                            activeDeletion?.reportId === report._id
                          }
                          onClick={(event) =>
                            handleRequestDelete(report, event.currentTarget)
                          }
                        >
                          Delete report
                        </button>
                      </div>

                      {activeDeletion?.reportId === report._id && (
                        <div
                          className="community-reports__delete-confirmation"
                          role="group"
                          aria-labelledby={`delete-title-${report._id}`}
                          aria-describedby={`delete-help-${report._id}`}
                        >
                          <p id={`delete-title-${report._id}`}>
                            <strong>Delete this report?</strong>
                          </p>

                          <p id={`delete-help-${report._id}`}>
                            This permanently removes your observation.
                          </p>

                          {deleteError && (
                            <p
                              className="community-reports__delete-error"
                              ref={deleteErrorRef}
                              role="alert"
                              tabIndex={-1}
                            >
                              {deleteError}
                            </p>
                          )}

                          <div className="community-reports__report-actions">
                            <button
                              className="community-reports__button"
                              ref={cancelDeleteRef}
                              type="button"
                              disabled={isMutating}
                              onClick={handleCancelDelete}
                            >
                              Cancel
                            </button>

                            <button
                              className="community-reports__button community-reports__button--danger"
                              type="button"
                              disabled={isMutating}
                              onClick={handleConfirmDelete}
                            >
                              {isMutating ? "Deleting…" : "Confirm delete"}
                            </button>
                          </div>

                          {isMutating && (
                            <p role="status">Deleting your report…</p>
                          )}
                        </div>
                      )}
                    </>
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
