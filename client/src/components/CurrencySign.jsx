import PropTypes from "prop-types";
const CurrencySign = ({
  color = "currentColor",
  size = 24,
  strokeWidth = 2,
  className = "",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-currency-sign ${className}`}
      {...props}
    >
      {/* Generic currency symbol - circular with extensions */}
      <circle cx="12" cy="12" r="6" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    </svg>
  );
};
CurrencySign.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  strokeWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};
export default CurrencySign;
