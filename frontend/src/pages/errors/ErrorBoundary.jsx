import { Component } from "react";
import PropTypes from "prop-types";
import ServerErrorPage from "../pages/errors/ServerErrorPage";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

export default ErrorBoundary;