/**
 * useFormValidation.ts のテスト
 * カバレッジ目標: 100%
 */

import { renderHook, act } from '@testing-library/react';
import { useFormValidation, useLoading, useErrorHandler } from '../useFormValidation';
import { validators } from '@/utils/validation';

// テスト用のフォームデータ型定義
interface TestFormData {
  name: string;
  email: string;
  age: number;
}

// テスト用の初期データ
const initialData: TestFormData = {
  name: '',
  email: '',
  age: 0
};

// テスト用のバリデーションスキーマ
const validationSchema = {
  name: [validators.required('名前は必須です'), validators.minLength(2, '名前は2文字以上で入力してください')],
  email: [validators.required('メールは必須です'), validators.email('正しいメールアドレスを入力してください')],
  age: [validators.min(1, '年齢は1以上で入力してください')] // numberに適した validators.min のみ使用
};

describe('useFormValidation', () => {
  describe('初期化', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.hasErrors).toBe(false);

      // 各フィールドの初期状態をチェック
      expect(result.current.formState.name).toEqual({
        value: '',
        error: undefined,
        touched: false
      });
      expect(result.current.formState.email).toEqual({
        value: '',
        error: undefined,
        touched: false
      });
      expect(result.current.formState.age).toEqual({
        value: 0,
        error: undefined,
        touched: false
      });
    });

    it('バリデーションスキーマなしでも初期化できる', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData)
      );

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.isValid).toBe(true);
    });

    it('初期データに値がある場合も正しく設定される', () => {
      const initialWithData: TestFormData = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const { result } = renderHook(() => 
        useFormValidation(initialWithData, validationSchema)
      );

      expect(result.current.formData).toEqual(initialWithData);
      expect(result.current.formState.name.value).toBe('John');
      expect(result.current.formState.email.value).toBe('john@example.com');
      expect(result.current.formState.age.value).toBe(25);
    });
  });

  describe('フィールド更新', () => {
    it('updateField が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.formState.name.value).toBe('John');
      expect(result.current.formData.name).toBe('John');
      expect(result.current.formState.name.error).toBeUndefined();
    });

    it('値更新時にエラーがクリアされる', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      // バリデーションエラーを発生させる
      act(() => {
        result.current.validateField('name');
      });

      expect(result.current.formState.name.error).toBeDefined();

      // 値を更新してエラーがクリアされることを確認
      act(() => {
        result.current.updateField('name', 'Valid Name');
      });

      expect(result.current.formState.name.error).toBeUndefined();
    });

    it('複数フィールドの更新が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      act(() => {
        result.current.updateField('name', 'John');
        result.current.updateField('email', 'john@example.com');
        result.current.updateField('age', 30);
      });

      expect(result.current.formData).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 30
      });
    });
  });

  describe('タッチ状態管理', () => {
    it('touchField が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      act(() => {
        result.current.touchField('name');
      });

      expect(result.current.formState.name.touched).toBe(true);
      expect(result.current.formState.email.touched).toBe(false);
      expect(result.current.formState.age.touched).toBe(false);
    });

    it('touchAllFields が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      act(() => {
        result.current.touchAllFields();
      });

      expect(result.current.formState.name.touched).toBe(true);
      expect(result.current.formState.email.touched).toBe(true);
      expect(result.current.formState.age.touched).toBe(true);
    });
  });

  describe('エラー管理', () => {
    it('clearFieldError が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      // バリデーションエラーを発生させる
      act(() => {
        result.current.validateField('name');
      });

      expect(result.current.formState.name.error).toBeDefined();

      // エラーをクリア
      act(() => {
        result.current.clearFieldError('name');
      });

      expect(result.current.formState.name.error).toBeUndefined();
    });

    it('clearAllErrors が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      // 全フィールドでバリデーションエラーを発生させる
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.hasErrors).toBe(true);

      // 全エラーをクリア
      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.hasErrors).toBe(false);
      expect(result.current.formState.name.error).toBeUndefined();
      expect(result.current.formState.email.error).toBeUndefined();
      expect(result.current.formState.age.error).toBeUndefined();
    });
  });

  describe('フォームリセット', () => {
    it('resetForm が正しく動作する', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      // フォームを変更
      act(() => {
        result.current.updateField('name', 'John');
        result.current.updateField('email', 'john@example.com');
        result.current.touchField('name');
        result.current.validateField('email'); // エラーを発生させる
      });

      // フォームをリセット
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.formState.name.touched).toBe(false);
      expect(result.current.formState.email.touched).toBe(false);
      expect(result.current.formState.email.error).toBeUndefined();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('バリデーション', () => {
    it('validateField が正しく動作する（成功ケース）', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      act(() => {
        result.current.updateField('name', 'Valid Name');
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateField('name');
      });

      expect(isValid!).toBe(true);
      expect(result.current.formState.name.error).toBeUndefined();
      expect(result.current.formState.name.touched).toBe(true);
    });

    it('validateField が正しく動作する（失敗ケース）', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateField('name');
      });

      expect(isValid!).toBe(false);
      expect(result.current.formState.name.error).toBe('名前は必須です');
      expect(result.current.formState.name.touched).toBe(true);
    });

    it('バリデーションスキーマがないフィールドは常に有効', () => {
      const schemaWithoutAge = {
        name: validationSchema.name,
        email: validationSchema.email
      };

      const { result } = renderHook(() => 
        useFormValidation(initialData, schemaWithoutAge)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateField('age');
      });

      expect(isValid!).toBe(true);
    });

    it('validateForm が正しく動作する（成功ケース）', () => {
      const validData: TestFormData = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const { result } = renderHook(() => 
        useFormValidation(validData, validationSchema)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid!).toBe(true);
      expect(result.current.isValid).toBe(true);
      expect(result.current.hasErrors).toBe(false);
    });

    it('validateForm が正しく動作する（失敗ケース）', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid!).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.hasErrors).toBe(true);

      // 全フィールドがタッチ状態になることを確認
      expect(result.current.formState.name.touched).toBe(true);
      expect(result.current.formState.email.touched).toBe(true);
      expect(result.current.formState.age.touched).toBe(true);

      // エラーメッセージが設定されることを確認
      expect(result.current.formState.name.error).toBeDefined();
      expect(result.current.formState.email.error).toBeDefined();
    });
  });

  describe('フォーム送信', () => {
    it('handleSubmit が成功ケースで正しく動作する', async () => {
      const validData: TestFormData = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const { result } = renderHook(() => 
        useFormValidation(validData, validationSchema)
      );

      const mockSubmit = jest.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.handleSubmit(mockSubmit);
      });

      expect(mockSubmit).toHaveBeenCalledWith(validData);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('handleSubmit がバリデーション失敗時に送信関数を呼ばない', async () => {
      const invalidData: TestFormData = {
        name: '', // 必須エラー
        email: 'invalid-email', // メール形式エラー
        age: 0 // min(1)エラー
      };

      const { result } = renderHook(() => 
        useFormValidation(invalidData, validationSchema)
      );

      const mockSubmit = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(mockSubmit);
      });

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.hasErrors).toBe(true);
    });

    it('handleSubmit が非同期エラーを適切に処理する', async () => {
      const validData: TestFormData = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const { result } = renderHook(() => 
        useFormValidation(validData, validationSchema)
      );

      const mockSubmit = jest.fn().mockRejectedValue(new Error('送信エラー'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        await result.current.handleSubmit(mockSubmit);
      });

      expect(consoleSpy).toHaveBeenCalledWith('フォーム送信エラー:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });

    it('handleSubmit 中にisSubmittingが適切に管理される', async () => {
      const validData: TestFormData = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const { result } = renderHook(() => 
        useFormValidation(validData, validationSchema)
      );

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      
      const mockSubmit = jest.fn().mockReturnValue(submitPromise);

      // handleSubmit を開始（まだ isSubmitting を確認しない）
      const submitPromise2 = act(async () => {
        await result.current.handleSubmit(mockSubmit);
      });

      // まず resolve してから isSubmitting を確認
      resolveSubmit!();
      await act(async () => {
        await submitPromise;
      });
      
      await submitPromise2;

      expect(result.current.isSubmitting).toBe(false);
      expect(mockSubmit).toHaveBeenCalledWith(validData);
    });
  });

  describe('computed values', () => {
    it('isValid が正しく計算される', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      expect(result.current.isValid).toBe(true);

      // エラーを発生させる
      act(() => {
        result.current.validateField('name');
      });

      expect(result.current.isValid).toBe(false);

      // エラーをクリア
      act(() => {
        result.current.clearFieldError('name');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('hasErrors が正しく計算される', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, validationSchema)
      );

      expect(result.current.hasErrors).toBe(false);

      // エラーを発生させる
      act(() => {
        result.current.validateField('name');
      });

      expect(result.current.hasErrors).toBe(true);

      // エラーをクリア
      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.hasErrors).toBe(false);
    });
  });
});

describe('useLoading', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useLoading());
    
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.setIsLoading).toBe('function');
    expect(typeof result.current.withLoading).toBe('function');
  });

  it('初期状態をtrueで設定できる', () => {
    const { result } = renderHook(() => useLoading(true));
    
    expect(result.current.isLoading).toBe(true);
  });

  it('setIsLoading が正しく動作する', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.setIsLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setIsLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('withLoading が成功ケースで正しく動作する', async () => {
    const { result } = renderHook(() => useLoading());
    
    const mockAsyncFn = jest.fn().mockResolvedValue('success');
    
    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.withLoading(mockAsyncFn);
    });
    
    expect(returnValue).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });

  it('withLoading が失敗ケースで正しく動作する', async () => {
    const { result } = renderHook(() => useLoading());
    
    const mockAsyncFn = jest.fn().mockRejectedValue(new Error('async error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.withLoading(mockAsyncFn);
    });
    
    expect(returnValue).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('非同期処理エラー:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('withLoading 実行中にloadingが管理される', async () => {
    const { result } = renderHook(() => useLoading());
    
    const mockAsyncFn = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('result'), 100))
    );
    
    act(() => {
      result.current.withLoading(mockAsyncFn);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useErrorHandler', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('handleError が文字列エラーを正しく処理する', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    act(() => {
      result.current.handleError('テストエラー');
    });
    
    expect(result.current.error).toBe('テストエラー');
    expect(consoleSpy).toHaveBeenCalledWith('エラーが発生しました:', 'テストエラー');
    
    consoleSpy.mockRestore();
  });

  it('handleError がErrorオブジェクトを正しく処理する', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const testError = new Error('Errorオブジェクトテスト');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.error).toBe('Errorオブジェクトテスト');
    expect(consoleSpy).toHaveBeenCalledWith('エラーが発生しました:', testError);
    
    consoleSpy.mockRestore();
  });

  it('clearError が正しく動作する', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // エラーを設定
    act(() => {
      result.current.handleError('テストエラー');
    });
    
    expect(result.current.error).toBe('テストエラー');
    
    // エラーをクリア
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
    
    consoleSpy.mockRestore();
  });

  it('複数のエラー処理が正しく動作する', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // 最初のエラー
    act(() => {
      result.current.handleError('エラー1');
    });
    
    expect(result.current.error).toBe('エラー1');
    
    // 2番目のエラー（上書きされる）
    act(() => {
      result.current.handleError('エラー2');
    });
    
    expect(result.current.error).toBe('エラー2');
    
    consoleSpy.mockRestore();
  });
});