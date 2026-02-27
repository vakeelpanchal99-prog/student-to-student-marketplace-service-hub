import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useUpdateServiceListing } from '../hooks/useQueries';
import type { ServiceListing } from '../backend';

const CATEGORIES = [
  'Tutoring',
  'Assignment Help',
  'Notes Sharing',
  'Project Help',
  'Exam Prep',
  'Language Learning',
  'Coding Help',
  'Design',
  'Other',
];

interface EditServiceListingModalProps {
  open: boolean;
  onClose: () => void;
  listing: ServiceListing;
}

export default function EditServiceListingModal({
  open,
  onClose,
  listing,
}: EditServiceListingModalProps) {
  const updateListing = useUpdateServiceListing();

  const [serviceDescription, setServiceDescription] = useState(listing.serviceDescription);
  const [category, setCategory] = useState(listing.category);
  const [helperName, setHelperName] = useState(listing.helperName);
  const [helperWhatsapp, setHelperWhatsapp] = useState(listing.helperWhatsapp);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!serviceDescription.trim() || serviceDescription.trim().length < 20)
      newErrors.serviceDescription = 'Description must be at least 20 characters';
    if (!category) newErrors.category = 'Category is required';
    if (!helperName.trim()) newErrors.helperName = 'Your name is required';
    if (!helperWhatsapp.trim()) newErrors.helperWhatsapp = 'WhatsApp number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await updateListing.mutateAsync({
      listingId: listing.listingId,
      updateData: {
        serviceDescription: serviceDescription.trim(),
        category,
        helperName: helperName.trim(),
        helperWhatsapp: helperWhatsapp.trim(),
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <Label htmlFor="edit-desc">Service Description</Label>
            <Textarea
              id="edit-desc"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Describe your service in detail (min 20 characters)"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {serviceDescription.length} / 20 min characters
            </p>
            {errors.serviceDescription && (
              <p className="text-destructive text-xs mt-1">{errors.serviceDescription}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-helper-name">Your Name</Label>
            <Input
              id="edit-helper-name"
              value={helperName}
              onChange={(e) => setHelperName(e.target.value)}
              placeholder="Your name"
            />
            {errors.helperName && <p className="text-destructive text-xs mt-1">{errors.helperName}</p>}
          </div>

          <div>
            <Label htmlFor="edit-helper-whatsapp">WhatsApp Number</Label>
            <Input
              id="edit-helper-whatsapp"
              value={helperWhatsapp}
              onChange={(e) => setHelperWhatsapp(e.target.value)}
              placeholder="+91 98765 43210"
            />
            {errors.helperWhatsapp && (
              <p className="text-destructive text-xs mt-1">{errors.helperWhatsapp}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateListing.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateListing.isPending}>
            {updateListing.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
