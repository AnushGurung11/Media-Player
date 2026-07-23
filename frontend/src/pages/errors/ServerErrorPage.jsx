import PropTypes from "prop-types";

function ServerErrorPage({ onRetry }) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-6xl font-display font-extrabold text-blood mb-2">500</p>
        <h1 className="text-xl mb-2">Something went wrong</h1>
        <p className="text-sm text-muted mb-6">An unexpected error occurred. Try reloading the page.</p>
        <button onClick={onRetry || (() => window.location.reload())} className="btn-primary">
          Reload
        </button>
      </div>
    </div>
  );
}

ServerErrorPage.propTypes = { onRetry: PropTypes.func };
ServerErrorPage.defaultProps = { onRetry: undefined };

export default ServerErrorPage;