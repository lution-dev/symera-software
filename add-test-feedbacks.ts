import { db } from './server/db';
import { eventFeedbacks, feedbackMetrics } from './shared/schema';

async function addTestFeedbacks() {
  try {
    console.log('Adicionando feedbacks de teste...');

    // Gerar IDs únicos para feedback
    const feedbackId1 = 'fb_' + Date.now() + '_1';
    const feedbackId2 = 'fb_' + Date.now() + '_2';
    const feedbackId3 = 'fb_' + Date.now() + '_3';

    // Adicionar feedbacks de teste para o evento 6
    const testFeedbacks = [
      {
        eventId: 6,
        feedbackId: feedbackId1,
        name: 'Maria Silva',
        email: 'maria@email.com',
        rating: 5,
        comment: 'Evento incrível! Organização perfeita e tudo saiu como planejado. Parabéns!',
        isAnonymous: false
      },
      {
        eventId: 6,
        feedbackId: feedbackId2,
        name: null,
        email: null,
        rating: 4,
        comment: 'Festa muito boa, música excelente. Só achei que poderia ter mais variedade de comida.',
        isAnonymous: true
      },
      {
        eventId: 6,
        feedbackId: feedbackId3,
        name: 'João Santos',
        email: 'joao@email.com',
        rating: 5,
        comment: 'Perfeito! A decoração estava linda e a festa foi inesquecível. Muito obrigado!',
        isAnonymous: false
      }
    ];

    // Inserir feedbacks
    for (const feedback of testFeedbacks) {
      await db.insert(eventFeedbacks).values(feedback);
      console.log(`Feedback adicionado: ${feedback.feedbackId}`);
    }

    // Adicionar métricas de exemplo
    const testMetrics = [
      {
        feedbackId: feedbackId1,
        viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        feedbackId: feedbackId2,
        viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
      },
      {
        feedbackId: feedbackId3,
        viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ];

    // Inserir métricas
    for (const metric of testMetrics) {
      await db.insert(feedbackMetrics).values(metric);
      console.log(`Métrica adicionada: ${metric.feedbackId}`);
    }

    console.log('✅ Feedbacks de teste adicionados com sucesso!');
    console.log('📊 Feedbacks criados:');
    console.log(`- ${testFeedbacks.length} feedbacks`);
    console.log(`- ${testMetrics.length} métricas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar feedbacks:', error);
    process.exit(1);
  }
}

addTestFeedbacks();