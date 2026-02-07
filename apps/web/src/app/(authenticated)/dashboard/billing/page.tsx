'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Download,
  Check,
  AlertCircle,
  Zap,
  Database,
  Activity,
  DollarSign,
} from 'lucide-react'

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Starter',
      price: billingPeriod === 'monthly' ? 49 : 470,
      description: 'For small teams',
      features: ['3 database connections', '10,000 queries/month', 'Basic scheduling', 'Email support'],
      current: false,
    },
    {
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 199 : 1910,
      description: 'For growing teams',
      features: ['Unlimited connections', '100,000 queries/month', 'Advanced workflows', 'AI assistant', 'Priority support', 'SSO'],
      current: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
      current: false,
    },
  ]

  const usage = {
    queries: { used: 45000, limit: 100000 },
    connections: { used: 8, limit: -1 },
    storage: { used: 2.4, limit: 10 },
  }

  const invoices = [
    { date: 'Feb 1, 2024', amount: 199, status: 'Paid', id: 'INV-2024-002' },
    { date: 'Jan 1, 2024', amount: 199, status: 'Paid', id: 'INV-2024-001' },
    { date: 'Dec 1, 2023', amount: 199, status: 'Paid', id: 'INV-2023-012' },
  ]

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Professional Plan
              </CardTitle>
              <CardDescription>Your current subscription</CardDescription>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly cost</p>
              <p className="text-2xl font-bold">$199</p>
              <p className="text-xs text-muted-foreground">Next billing: Mar 1, 2024</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment method</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>•••• 4242</span>
              </div>
              <Button variant="link" className="h-auto p-0 text-xs">
                Update payment method
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Billing email</p>
              <p>billing@company.com</p>
              <Button variant="link" className="h-auto p-0 text-xs">
                Update billing email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your usage this billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Queries
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.queries.used.toLocaleString()} / {usage.queries.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(usage.queries.used / usage.queries.limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((usage.queries.used / usage.queries.limit) * 100)}% used
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Connections
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.connections.used} / Unlimited
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">8 active connections</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Query Cost
                </span>
                <span className="text-sm text-muted-foreground">
                  ${usage.storage.used.toFixed(2)} / ${usage.storage.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(usage.storage.used / usage.storage.limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Compute costs this period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Choose the plan that fits your needs</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  billingPeriod === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-emerald-600">-20%</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border-2 transition-colors ${
                  plan.current ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.current && <Badge>Current</Badge>}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current plan' : plan.price === 'Custom' ? 'Contact sales' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount}</p>
                    <Badge variant="success" className="text-xs">{invoice.status}</Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
