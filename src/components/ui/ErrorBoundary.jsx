import React, { Component } from "react";
import PropTypes from "prop-types";
import FallbackUI from "./FallbackUI.jsx";

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole component tree.
 * 
 * Supports:
 * - fallback prop: React element or render function (error, resetErrorBoundary) => ReactNode
 * - FallbackComponent prop: Component to render
 * - default fallback: FallbackUI
 * - onError / onReset callbacks
 * - resetKeys: array of dependencies that trigger a reset when changed
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    } else {
      console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== (prevProps.resetKeys && prevProps.resetKeys[idx])
      );
      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, FallbackComponent, compact, children } = this.props;

    if (hasError) {
      if (typeof fallback === "function") {
        return fallback(error, this.resetErrorBoundary);
      }
      if (fallback) {
        return fallback;
      }
      if (FallbackComponent) {
        const FallbackComp = FallbackComponent;
        return (
          <FallbackComp
            error={error}
            resetErrorBoundary={this.resetErrorBoundary}
            compact={compact}
          />
        );
      }
      return (
        <FallbackUI
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          compact={compact}
        />
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  FallbackComponent: PropTypes.elementType,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  resetKeys: PropTypes.array,
  compact: PropTypes.bool,
};

export default ErrorBoundary;
