import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 案件データの取得（実際の実装ではデータベースから取得）
    // ここではダミーデータを使用
    const caseData = {
      id,
      customerName: '田中太郎',
      customerPhone: '090-1234-5678',
      customerEmail: 'tanaka@example.com',
      moveDate: '2024-03-15',
      moveTime: '午前（9:00-12:00）',
      moveDateKind: '希望日',
      fromAddress: '東京都渋谷区渋谷1-1-1',
      toAddress: '神奈川県横浜市西区みなとみらい1-1-1',
      totalPoints: 15.5,
      additionalServices: ['🏠 建物養生（壁や床の保護）', '📦 荷造り・荷ほどきの代行'],
      estimatedPrice: 50000,
      taxRate: 10,
      priceTaxIncluded: 55000,
      contractStatus: 'estimate',
      notes: '特別な要望はありません'
    };

    // 自社情報（実際の実装では設定から取得）
    const companyProfile = {
      name: '株式会社サンクワークス',
      postal: '〒150-0002',
      address: '東京都渋谷区渋谷2-1-1',
      tel: '03-1234-5678',
      email: 'info@syncworks.co.jp'
    };

    // PDFドキュメントの作成
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // ヘッダー（会社情報）
    doc.fontSize(20).font('Helvetica-Bold').text(companyProfile.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(companyProfile.postal, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(companyProfile.address, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`TEL: ${companyProfile.tel}`, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Email: ${companyProfile.email}`, { align: 'center' });
    
    doc.moveDown(2);
    
    // タイトル
    doc.fontSize(18).font('Helvetica-Bold').text('引越し見積もり書', { align: 'center' });
    doc.moveDown(1);
    
    // 見積もり番号
    doc.fontSize(12).font('Helvetica').text(`見積もり番号: ${id}`, { align: 'right' });
    doc.moveDown(1);
    
    // 顧客情報
    doc.fontSize(14).font('Helvetica-Bold').text('顧客情報');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`顧客名: ${caseData.customerName}`);
    doc.fontSize(10).font('Helvetica').text(`電話番号: ${caseData.customerPhone}`);
    if (caseData.customerEmail) {
      doc.fontSize(10).font('Helvetica').text(`メールアドレス: ${caseData.customerEmail}`);
    }
    
    doc.moveDown(1);
    
    // 引越し情報
    doc.fontSize(14).font('Helvetica-Bold').text('引越し情報');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`引越し日: ${caseData.moveDate} (${caseData.moveDateKind})`);
    doc.fontSize(10).font('Helvetica').text(`時間帯: ${caseData.moveTime}`);
    doc.fontSize(10).font('Helvetica').text(`引越し元: ${caseData.fromAddress}`);
    doc.fontSize(10).font('Helvetica').text(`引越し先: ${caseData.toAddress}`);
    
    doc.moveDown(1);
    
    // 荷物・サービス情報
    doc.fontSize(14).font('Helvetica-Bold').text('荷物・サービス情報');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`荷物ポイント数: ${caseData.totalPoints}pt`);
    
    if (caseData.additionalServices.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text('追加サービス:');
      caseData.additionalServices.forEach(service => {
        doc.fontSize(10).font('Helvetica').text(`  • ${service}`);
      });
    }
    
    doc.moveDown(1);
    
    // 見積金額
    doc.fontSize(14).font('Helvetica-Bold').text('見積金額');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`税抜金額: ${caseData.estimatedPrice.toLocaleString()}円`);
    doc.fontSize(10).font('Helvetica').text(`税率: ${caseData.taxRate}%`);
    doc.fontSize(12).font('Helvetica-Bold').text(`税込金額: ${caseData.priceTaxIncluded.toLocaleString()}円`);
    
    doc.moveDown(1);
    
    // 備考
    if (caseData.notes) {
      doc.fontSize(14).font('Helvetica-Bold').text('備考・特記事項');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(caseData.notes);
      doc.moveDown(1);
    }
    
    // 但し書き
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').text('※入力内容に誤りがない場合に限る', { align: 'center' });
    
    // 作成日
    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica').text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, { align: 'right' });
    
    // PDFの生成完了
    doc.end();
    
    // レスポンスヘッダーの設定
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="estimate-${id}.pdf"`
        }
      });
    });
    
    // 一時的なレスポンスを返す
    return new NextResponse('PDF生成中...', { status: 200 });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json(
      { error: 'PDFの生成に失敗しました' },
      { status: 500 }
    );
  }
}
