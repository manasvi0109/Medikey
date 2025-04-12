import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FamilyMember, InsertFamilyMember } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, User, FolderOpen, MoreVertical, UserPlus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const familyMemberFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

export default function Family() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const { data: familyMembers, isLoading } = useQuery<FamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  const form = useForm<z.infer<typeof familyMemberFormSchema>>({
    resolver: zodResolver(familyMemberFormSchema),
    defaultValues: {
      name: "",
      relationship: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      allergies: "",
      chronicConditions: "",
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: InsertFamilyMember) => {
      return apiRequest("POST", "/api/family-members", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Family member added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add family member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data: { id: number, member: Partial<InsertFamilyMember> }) => {
      return apiRequest("PATCH", `/api/family-members/${data.id}`, data.member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      setEditingMember(null);
      form.reset();
      toast({
        title: "Success",
        description: "Family member updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update family member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/family-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      toast({
        title: "Success",
        description: "Family member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove family member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof familyMemberFormSchema>) => {
    if (editingMember) {
      updateMemberMutation.mutate({
        id: editingMember.id,
        member: data,
      });
    } else {
      addMemberMutation.mutate(data as InsertFamilyMember);
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || "",
      bloodType: member.bloodType || "",
      allergies: member.allergies || "",
      chronicConditions: member.chronicConditions || "",
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Family Vault</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your family members' health records
          </p>
        </div>
        <Button onClick={() => {
          form.reset();
          setIsAddModalOpen(true);
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-gray-100"></CardHeader>
              <CardContent className="h-40 bg-gray-50"></CardContent>
              <CardFooter className="h-16 bg-gray-100"></CardFooter>
            </Card>
          ))}
        </div>
      ) : familyMembers && familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="p-4 flex items-center">
                <div className="flex items-center flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatarUrl || ""} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      {member.relationship}
                      {member.dateOfBirth ? `, ${calculateAge(member.dateOfBirth)} years` : ""}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditMember(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${member.name}?`)) {
                          deleteMemberMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="border-t border-gray-200 px-4 py-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="col-span-1">
                    <dt className="text-xs font-medium text-gray-500">Blood Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.bloodType || "—"}</dd>
                  </div>
                  <div className="col-span-1">
                    <dt className="text-xs font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.gender || "—"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.allergies || "None"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500">Chronic Conditions</dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.chronicConditions || "None"}</dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Button variant="outline" className="w-full">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  View Medical Records
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <User className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Family Members Yet</h3>
            <p className="text-gray-500 mb-4">
              Add family members to manage their health records all in one place
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Family Member
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Family Member Modal */}
      <Dialog 
        open={isAddModalOpen || !!editingMember} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingMember(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Family Member" : "Add Family Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember 
                ? "Update information for your family member" 
                : "Add a new member to your family vault"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g. Spouse, Child, Parent"
                    {...form.register("relationship")}
                  />
                  {form.formState.errors.relationship && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.relationship.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    placeholder="e.g. Male, Female, Other"
                    {...form.register("gender")}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    placeholder="e.g. A+, B-, O+"
                    {...form.register("bloodType")}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    placeholder="e.g. Peanuts, Penicillin"
                    {...form.register("allergies")}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronicConditions"
                    placeholder="e.g. Asthma, Diabetes"
                    {...form.register("chronicConditions")}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMember(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addMemberMutation.isPending || updateMemberMutation.isPending}
              >
                {(addMemberMutation.isPending || updateMemberMutation.isPending) ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
