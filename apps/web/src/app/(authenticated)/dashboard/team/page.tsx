'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Database,
  Trash2,
  Clock,
  CheckCircle,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  avatar?: string
  lastActive: string
  status: 'active' | 'pending'
  queriesRun: number
}

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@company.com',
      role: 'owner',
      lastActive: '2 minutes ago',
      status: 'active',
      queriesRun: 1250,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'admin',
      lastActive: '1 hour ago',
      status: 'active',
      queriesRun: 890,
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'editor',
      lastActive: '3 hours ago',
      status: 'active',
      queriesRun: 456,
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@company.com',
      role: 'viewer',
      lastActive: 'Yesterday',
      status: 'active',
      queriesRun: 78,
    },
    {
      id: '5',
      name: '',
      email: 'newuser@company.com',
      role: 'editor',
      lastActive: 'Pending',
      status: 'pending',
      queriesRun: 0,
    },
  ]

  const roleColors = {
    owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }

  const rolePermissions = {
    owner: ['Full access', 'Manage billing', 'Delete workspace'],
    admin: ['Manage team', 'Manage connections', 'Run queries'],
    editor: ['Create queries', 'Run queries', 'View connections'],
    viewer: ['View queries', 'View results'],
  }

  const handleInvite = () => {
    console.log('Inviting:', inviteEmail, 'as', inviteRole)
    setInviteDialogOpen(false)
    setInviteEmail('')
    setInviteRole('editor')
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your DataForge workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {rolePermissions[inviteRole as keyof typeof rolePermissions]?.join(' • ')}
                </p>
              </div>
              <Button onClick={handleInvite} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(rolePermissions).map(([role, perms]) => (
              <div key={role} className="space-y-2">
                <Badge className={roleColors[role as keyof typeof roleColors]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {perms.map((perm) => (
                    <li key={perm}>• {perm}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {teamMembers.filter((m) => m.status === 'active').length} active members,{' '}
            {teamMembers.filter((m) => m.status === 'pending').length} pending invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name
                        ? member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : member.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.name || member.email}
                      </p>
                      {member.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    {member.name && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {member.lastActive}
                      </span>
                      {member.queriesRun > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {member.queriesRun} queries
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={roleColors[member.role]}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={member.role === 'owner'}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change role</DropdownMenuItem>
                      {member.status === 'pending' && (
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend invitation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {member.status === 'pending' ? 'Cancel invitation' : 'Remove member'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
