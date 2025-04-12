import { FamilyMember } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { FolderOpen, MoreVertical, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function FamilyVaultSection() {
  const { data: familyMembers, isLoading, error } = useQuery<FamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Family Vault</h2>
        <Link href="/family">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <FamilyMemberSkeleton />
            <FamilyMemberSkeleton />
          </>
        ) : error ? (
          <Card className="col-span-full p-8 text-center">
            <p className="text-red-500 mb-2">Failed to load family members</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        ) : familyMembers && familyMembers.length > 0 ? (
          familyMembers.slice(0, 3).map((member) => (
            <FamilyMemberCard key={member.id} member={member} />
          ))
        ) : (
          <Card className="col-span-full p-8 text-center">
            <p className="text-gray-500 mb-2">No family members added yet</p>
            <Link href="/family">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Family Member
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

interface FamilyMemberCardProps {
  member: FamilyMember;
}

function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:px-6 flex items-center">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Edit details</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="col-span-1">
              <dt className="text-xs font-medium text-gray-500">Blood Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.bloodType || "—"}</dd>
            </div>
            <div className="col-span-1">
              <dt className="text-xs font-medium text-gray-500">Allergies</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.allergies || "None"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium text-gray-500">Chronic Conditions</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.chronicConditions || "None"}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <Link href={`/family/${member.id}/records`}>
          <Button variant="outline" className="w-full">
            <FolderOpen className="mr-2 h-4 w-4 text-gray-500" />
            View Medical Records
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function FamilyMemberSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="ml-4 flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="col-span-1">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
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
