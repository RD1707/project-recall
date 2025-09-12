import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler'; // Importamos o handler central

async function apiCall(endpoint) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Sessão inválida. Por favor, faça login novamente.");
    }

    let rpcName, params;
    
    if (endpoint.startsWith('/reviews-over-time')) {
        rpcName = 'get_daily_review_counts';
        const range = new URLSearchParams(endpoint.split('?')[1]).get('range');
        params = { user_id_param: session.user.id, days_param: parseInt(range, 10) };
    } else if (endpoint === '/summary') {
        rpcName = 'get_analytics_summary';
        params = { user_id_param: session.user.id };
    } else if (endpoint === '/insights') {
        rpcName = 'get_performance_insights';
        params = { user_id_param: session.user.id };
    } else {
        throw new Error("Endpoint de analytics desconhecido.");
    }

    const { data, error } = await supabase.rpc(rpcName, params);
    
    if (error) throw error;

    if(rpcName === 'get_analytics_summary') return data[0] || {};
    
    return data;

  } catch (error) {
    throw handleError(error, { context: `apiCall:${endpoint}` });
  }
}

export const fetchAnalyticsSummary = () => apiCall('/summary');
export const fetchReviewsOverTime = (range = 7) => apiCall(`/reviews-over-time?range=${range}`);
export const fetchPerformanceInsights = () => apiCall('/insights');