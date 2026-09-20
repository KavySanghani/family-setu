import { supabase } from '../../../shared/db/supabase';

export class DashboardService {
  async getOfficerStats() {
    const [families, members, applications, benefits, verifications, dataQuality] = await Promise.all([
      supabase.from('family').select('*', { count: 'exact', head: true }),
      supabase.from('family_member').select('*', { count: 'exact', head: true }),
      supabase.from('scheme_application').select('*', { count: 'exact', head: true }),
      supabase.from('benefit_history').select('*', { count: 'exact', head: true }),
      supabase.from('verification_request').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('data_quality_issue').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
    ]);

    return {
      totalFamilies: families.count || 0,
      totalMembers: members.count || 0,
      totalApplications: applications.count || 0,
      totalBenefits: benefits.count || 0,
      pendingVerifications: verifications.count || 0,
      openDataQualityIssues: dataQuality.count || 0,
    };
  }

  async getApplicationStatusDistribution() {
    const { data, error } = await supabase
      .from('scheme_application')
      .select('status');
    if (error || !data) return {};
    const dist: Record<string, number> = {};
    for (const row of data) {
      dist[row.status] = (dist[row.status] || 0) + 1;
    }
    return dist;
  }

  async getSchemePopularity() {
    const { data, error } = await supabase
      .from('scheme_application')
      .select('scheme_id');
    if (error || !data) return {};
    const dist: Record<string, number> = {};
    for (const row of data) {
      dist[row.scheme_id] = (dist[row.scheme_id] || 0) + 1;
    }
    return dist;
  }
}
