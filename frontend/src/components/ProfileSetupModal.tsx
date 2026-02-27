import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfileSetupModal() {
  const [open, setOpen] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const saveProfileMutation = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await saveProfileMutation.mutateAsync({
        displayName: displayName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        bio: '',
      });
      toast.success('Profile set up successfully!');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to StudentHub! 🎓</DialogTitle>
          <DialogDescription>
            Set up your profile so other students can identify you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="setup-name">Your Name *</Label>
            <Input
              id="setup-name"
              placeholder="e.g., Ahmad Razif"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-whatsapp">WhatsApp Number (optional)</Label>
            <Input
              id="setup-whatsapp"
              placeholder="e.g., 60123456789"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveProfileMutation.isPending || !displayName.trim()}
          className="w-full"
        >
          {saveProfileMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
