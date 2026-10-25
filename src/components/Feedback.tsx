import type {ApiRequestError} from "../services/api";
export function Feedback({title,description,error,onRetry}: {
  title: string; description?: string; error?: ApiRequestError | null; onRetry?: () => void;
}) {
  return <section className="message" role={error ? "alert" : "status"}>
    <div className="feedback-icon" aria-hidden="true">{error ? "!" : "◷"}</div>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {error && <p>{error.message}</p>}
    {error?.retryable && onRetry && <button className="retry" type="button" onClick={onRetry}>Volver a intentar</button>}
  </section>;
}
