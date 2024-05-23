const LoadingSpinner = ({ size = "md" }) => {
  const sizeClass = `loading-${size}`;

  return <span className={`loading loading-spinner loading-${sizeClass}`} />;
};
export default LoadingSpinner;
