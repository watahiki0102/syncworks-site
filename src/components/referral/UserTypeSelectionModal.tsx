/**
 * 利用種別選択モーダルコンポーネント
 * ログイン後に表示され、引越し事業者または紹介者としての利用種別を選択する
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserType } from '@/types/referral';
import { Building2, User, ArrowRight, CheckCircle } from 'lucide-react';

interface UserTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserTypeSelect: (userType: UserType) => void;
  defaultUserType?: UserType;
}

const UserTypeSelectionModal: React.FC<UserTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onUserTypeSelect,
  defaultUserType
}) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(defaultUserType || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultUserType) {
      setSelectedType(defaultUserType);
    }
  }, [defaultUserType]);

  const handleTypeSelect = (userType: UserType) => {
    setSelectedType(userType);
  };

  const handleSubmit = async () => {
    if (!selectedType) {return;}

    setIsSubmitting(true);
    try {
      // 選択された利用種別をlocalStorageに保存
      localStorage.setItem('userType', selectedType);
      
      // 親コンポーネントに選択結果を通知
      onUserTypeSelect(selectedType);
      
      // モーダルを閉じる
      onClose();
    } catch (error) {
      console.error('利用種別の保存に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userTypeOptions = [
    {
      type: 'mover' as UserType,
      title: '引越し事業者として利用する',
      description: '引越しサービスを提供し、顧客からの依頼を受けて業務を遂行します',
      icon: Building2,
      features: [
        '案件管理・スケジュール調整',
        '見積もり作成・管理',
        '顧客管理・フォローアップ',
        '収益分析・レポート'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'referrer' as UserType,
      title: '紹介者（不動産仲介）として利用する',
      description: '顧客に引越しサービスを紹介し、紹介料を受け取ります',
      icon: User,
      features: [
        '紹介案件の管理',
        '成約状況の追跡',
        '紹介料の計算・管理',
        '顧客サポート'
      ],
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="利用種別を選択してください"
    >
      <div>
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            あなたの業務内容に応じて、適切な利用種別を選択してください。
            選択後は変更可能ですが、一部の機能が制限される場合があります。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {userTypeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedType === option.type;
            
            return (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleTypeSelect(option.type)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedType || isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {isSubmitting ? '処理中...' : '選択を確定する'}
          </Button>
        </div>

        {defaultUserType && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              前回選択された利用種別: 
              <span className="font-medium text-gray-700 ml-1">
                {defaultUserType === 'mover' ? '引越し事業者' : '紹介者（不動産仲介）'}
              </span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserTypeSelectionModal;
