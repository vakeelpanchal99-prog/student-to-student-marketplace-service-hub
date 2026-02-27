import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateServiceListing } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['Tutoring', 'Design', 'Coding', 'Writing', 'Photography', 'Other'];

export default function CreateServiceListingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createMutation = useCreateServiceListing();

  const [serviceDescription, setServiceDescription] = useState('');
  const [category, setCategory] = useState('');
  const [helperName, setHelperName] = useState('');
  const [helperWhatsapp, setHelperWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!identity) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Login Required</h2>
        <p className="text-muted-foreground">Please log in to offer a service.</p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDescription || !category || !helperName || !helperWhatsapp) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        serviceDescription,
        category,
        helperName,
        helperWhatsapp,
      });
      toast.success('Service listing posted successfully!');
      navigate({ to: '/services' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create service listing';
      if (msg.includes('Unauthorized')) {
        toast.error('You are not authorized to create listings. Please ensure you are logged in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/services' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </button>

      <div className="bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Offer a Service</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Helper Name */}
          <div className="space-y-2">
            <Label htmlFor="helperName">Your Name *</Label>
            <Input
              id="helperName"
              placeholder="e.g., Siti"
              value={helperName}
              onChange={(e) => setHelperName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="serviceDescription">Service Description *</Label>
            <Textarea
              id="serviceDescription"
              placeholder="Describe what you offer, your experience, rates, etc."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="helperWhatsapp">WhatsApp Number *</Label>
            <Input
              id="helperWhatsapp"
              placeholder="e.g., 60123456789"
              value={helperWhatsapp}
              onChange={(e) => setHelperWhatsapp(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Service'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
