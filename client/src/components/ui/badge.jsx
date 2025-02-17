import { cn } from "../../lib/utils";
import { badgeVariants } from "./badge-variants";
import PropTypes from 'prop-types';

function Badge({
  className,
  variant,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};
Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
};

export { Badge };