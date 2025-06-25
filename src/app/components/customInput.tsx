// components/CustomInput.tsx
import { forwardRef } from 'react';

type Props = {
  value?: string;
  onClick?: () => void;
};

const CustomInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onClick }, ref) => (
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      className="your-input-style"
      placeholder="日付を選択"
    />
  )
);

export default CustomInput;
