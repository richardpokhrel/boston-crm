import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateLead } from '../../hooks/useLeads'
import { Button, Input, Select, PageHeader, Card } from '../../components/ui/index'

const SOURCES = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
]

export default function CreateLeadPage() {
  const navigate = useNavigate()
  const createLead = useCreateLead()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { source: 'manual' },
  })

  const onSubmit = (data) => {
    createLead.mutate(data, { onSuccess: () => navigate('/leads') })
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>
      </div>

      <PageHeader title="New Lead" subtitle="Add a new lead to the pipeline" />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Jane Smith"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <Input
              label="Phone *"
              placeholder="+977 98XXXXXXXX"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone is required' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Select
              label="Source *"
              options={SOURCES}
              error={errors.source?.message}
              {...register('source', { required: 'Source is required' })}
            />
            <Input
              label="Program Interest"
              placeholder="e.g. MBA, Computer Science"
              {...register('programInterest')}
            />
            <Input
              label="Destination Country"
              placeholder="e.g. UK, Canada, Australia"
              {...register('destinationCountry')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={createLead.isPending}
            >
              Create Lead
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/leads')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
