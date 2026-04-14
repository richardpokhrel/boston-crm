import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leadsApi } from '../api/leads'

export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  })
}

export const useLead = (id) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id).then((r) => r.data.data.lead),
    enabled: !!id,
  })
}

export const useCreateLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => leadsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead created successfully')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create lead'),
  })
}

export const useUpdateLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Lead updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })
}

export const useUpdateLeadStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Status updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Status update failed'),
  })
}

export const useDeleteLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })
}

// Admin hooks
export const useAdminUpdateLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.adminUpdateLead(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Lead updated by admin')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })
}

export const useAdminReassignLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignedCounsellor }) =>
      leadsApi.adminReassignLead(id, assignedCounsellor),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Lead reassigned')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reassign failed'),
  })
}

export const useAdminUpdateLeadStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.adminUpdateLeadStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Status updated by admin')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Status update failed'),
  })
}
