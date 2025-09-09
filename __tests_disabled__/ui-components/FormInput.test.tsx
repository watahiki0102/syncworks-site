/**
 * FormInput.tsx のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInputComponents, { 
  TextInput, 
  NumberInput, 
  TextArea, 
  Select, 
  Checkbox, 
  Radio, 
  DateInput 
} from '../FormInput';

describe('TextInput', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  describe('基本機能', () => {
    it('基本的なテキスト入力を表示する', () => {
      render(
        <TextInput 
          value="test value" 
          onChange={mockOnChange} 
          label="Test Input"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test value');
    });

    it('ラベルが表示される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          label="Test Label"
        />
      );
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('必須マークが表示される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          label="Required Field"
          required
        />
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('プレースホルダーが表示される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          placeholder="Enter text"
        />
      );
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('入力タイプ', () => {
    it('emailタイプが適用される', () => {
      render(
        <TextInput 
          type="email"
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('passwordタイプが適用される', () => {
      const { container } = render(
        <TextInput 
          type="password"
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('telタイプが適用される', () => {
      render(
        <TextInput 
          type="tel"
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('バリデーション', () => {
    it('エラーメッセージが表示される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          error="This field is required"
        />
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('エラー時にスタイルが適用される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          error="Error message"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border-red-300');
    });

    it('ヘルプテキストが表示される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          helpText="This is help text"
        />
      );
      
      expect(screen.getByText('This is help text')).toBeInTheDocument();
    });

    it('エラーがある場合ヘルプテキストが非表示になる', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          error="Error message"
          helpText="Help text"
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });

    it('maxLengthが適用される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          maxLength={10}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('minLengthが適用される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          minLength={5}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('patternが適用される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          pattern="[0-9]*"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('イベントハンドリング', () => {
    it('onChange イベントが動作する', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('new value');
    });

    it('onBlur イベントが動作する', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onBlur={mockOnBlur}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('状態', () => {
    it('disabled 状態が適用される', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          disabled
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });
});

describe('NumberInput', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  describe('基本機能', () => {
    it('数値入力フィールドを表示する', () => {
      render(
        <NumberInput 
          value={123} 
          onChange={mockOnChange} 
          label="Number Input"
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(123);
    });

    it('空の値を表示する', () => {
      render(
        <NumberInput 
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(null);
    });

    it('最小値・最大値・ステップが適用される', () => {
      render(
        <NumberInput 
          value={10} 
          onChange={mockOnChange} 
          min={0}
          max={100}
          step={5}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
      expect(input).toHaveAttribute('step', '5');
    });
  });

  describe('イベントハンドリング', () => {
    it('数値の変更が動作する', () => {
      render(
        <NumberInput 
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });
      
      expect(mockOnChange).toHaveBeenCalledWith(42);
    });

    it('空文字の変更が動作する', () => {
      render(
        <NumberInput 
          value={123} 
          onChange={mockOnChange} 
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('onBlur イベントが動作する', () => {
      render(
        <NumberInput 
          value={0} 
          onChange={mockOnChange} 
          onBlur={mockOnBlur}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.blur(input);
      
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });
});

describe('TextArea', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  describe('基本機能', () => {
    it('テキストエリアを表示する', () => {
      render(
        <TextArea 
          value="text area content" 
          onChange={mockOnChange} 
          label="Description"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('text area content');
    });

    it('行数が適用される', () => {
      render(
        <TextArea 
          value="" 
          onChange={mockOnChange} 
          rows={5}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('列数が適用される', () => {
      render(
        <TextArea 
          value="" 
          onChange={mockOnChange} 
          cols={40}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '40');
    });

    it('maxLengthが適用される', () => {
      render(
        <TextArea 
          value="" 
          onChange={mockOnChange} 
          maxLength={500}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('イベントハンドリング', () => {
    it('onChange イベントが動作する', () => {
      render(
        <TextArea 
          value="" 
          onChange={mockOnChange} 
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new content' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('new content');
    });
  });
});

describe('Select', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  describe('基本機能', () => {
    it('セレクトボックスを表示する', () => {
      render(
        <Select 
          value="option1" 
          onChange={mockOnChange} 
          options={options}
          label="Select Option"
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('option1');
    });

    it('オプションが表示される', () => {
      render(
        <Select 
          value="" 
          onChange={mockOnChange} 
          options={options}
        />
      );
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('プレースホルダーが表示される', () => {
      render(
        <Select 
          value="" 
          onChange={mockOnChange} 
          options={options}
          placeholder="Select an option"
        />
      );
      
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('無効なオプションが設定される', () => {
      render(
        <Select 
          value="" 
          onChange={mockOnChange} 
          options={options}
        />
      );
      
      const option3 = screen.getByText('Option 3');
      expect(option3).toHaveAttribute('disabled');
    });
  });

  describe('イベントハンドリング', () => {
    it('選択の変更が動作する', () => {
      render(
        <Select 
          value="" 
          onChange={mockOnChange} 
          options={options}
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option2' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('onBlur イベントが動作する', () => {
      render(
        <Select 
          value="" 
          onChange={mockOnChange} 
          options={options}
          onBlur={mockOnBlur}
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.blur(select);
      
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });
});

describe('Checkbox', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('基本機能', () => {
    it('チェックボックスを表示する', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
          label="Accept terms"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms');
      
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('チェック状態を表示する', () => {
      render(
        <Checkbox 
          checked={true} 
          onChange={mockOnChange} 
          label="Checked"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('ラベルなしでも動作する', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('エラーメッセージが表示される', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
          error="Please accept terms"
        />
      );
      
      expect(screen.getByText('Please accept terms')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('ヘルプテキストが表示される', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
          helpText="Check to agree"
        />
      );
      
      expect(screen.getByText('Check to agree')).toBeInTheDocument();
    });
  });

  describe('イベントハンドリング', () => {
    it('チェック変更が動作する', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('ラベルクリックで変更される', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
          label="Click me"
          id="checkbox-test"
        />
      );
      
      const label = screen.getByText('Click me');
      fireEvent.click(label);
      
      expect(mockOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe('状態', () => {
    it('disabled 状態が適用される', () => {
      render(
        <Checkbox 
          checked={false} 
          onChange={mockOnChange} 
          disabled
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });
  });
});

describe('Radio', () => {
  const mockOnChange = jest.fn();
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('基本機能', () => {
    it('ラジオボタンを表示する', () => {
      render(
        <Radio 
          value="option1" 
          selectedValue="option1"
          onChange={mockOnChange} 
          options={options}
          label="Radio Group"
          id="radio-test"
        />
      );
      
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
      expect(radios[0]).toBeChecked();
      expect(radios[1]).not.toBeChecked();
      expect(radios[2]).not.toBeChecked();
    });

    it('オプションラベルが表示される', () => {
      render(
        <Radio 
          value="" 
          selectedValue=""
          onChange={mockOnChange} 
          options={options}
          id="radio-test"
        />
      );
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('無効なオプションが設定される', () => {
      render(
        <Radio 
          value="" 
          selectedValue=""
          onChange={mockOnChange} 
          options={options}
          id="radio-test"
        />
      );
      
      const radios = screen.getAllByRole('radio');
      expect(radios[2]).toBeDisabled();
    });
  });

  describe('イベントハンドリング', () => {
    it('選択の変更が動作する', () => {
      render(
        <Radio 
          value="" 
          selectedValue=""
          onChange={mockOnChange} 
          options={options}
          id="radio-test"
        />
      );
      
      const radio2 = screen.getAllByRole('radio')[1];
      fireEvent.click(radio2);
      
      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('ラベルクリックで選択される', () => {
      render(
        <Radio 
          value="" 
          selectedValue=""
          onChange={mockOnChange} 
          options={options}
          id="radio-test"
        />
      );
      
      const label = screen.getByText('Option 1');
      fireEvent.click(label);
      
      expect(mockOnChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('状態', () => {
    it('全体のdisabled 状態が適用される', () => {
      render(
        <Radio 
          value="" 
          selectedValue=""
          onChange={mockOnChange} 
          options={options}
          disabled
          id="radio-test"
        />
      );
      
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });
  });
});

describe('DateInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('日付入力フィールドが表示される', () => {
    render(
      <DateInput 
        value="2023-12-25" 
        onChange={mockOnChange} 
        label="Date"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('2023-12-25');
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('FormInputComponents', () => {
  it('すべてのコンポーネントがエクスポートされている', () => {
    expect(FormInputComponents.TextInput).toBeDefined();
    expect(FormInputComponents.NumberInput).toBeDefined();
    expect(FormInputComponents.TextArea).toBeDefined();
    expect(FormInputComponents.Select).toBeDefined();
    expect(FormInputComponents.Checkbox).toBeDefined();
    expect(FormInputComponents.Radio).toBeDefined();
    expect(FormInputComponents.DateInput).toBeDefined();
  });
});

describe('FieldWrapper', () => {
  // FieldWrapperは内部コンポーネントなので、他のコンポーネント経由でテスト
  it('カスタムクラスが適用される', () => {
    const { container } = render(
      <TextInput 
        value="" 
        onChange={() => {}} 
        className="custom-field-class"
      />
    );
    
    const fieldWrapper = container.querySelector('.space-y-1');
    expect(fieldWrapper).toHaveClass('custom-field-class');
  });

  it('ラベルのカスタムクラスが適用される', () => {
    render(
      <TextInput 
        value="" 
        onChange={() => {}} 
        label="Custom Label"
        labelClassName="custom-label-class"
      />
    );
    
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-label-class');
  });

  it('入力フィールドのカスタムクラスが適用される', () => {
    render(
      <TextInput 
        value="" 
        onChange={() => {}} 
        inputClassName="custom-input-class"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-input-class');
  });
});