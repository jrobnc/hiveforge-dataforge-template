import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Boxes,
  Database,
  Zap,
  Shield,
  GitBranch,
  BarChart3,
  ArrowRight,
  Check,
  Github,
  Twitter,
  Linkedin,
  Play,
  Sparkles,
  Clock,
  Layers,
  Code,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
                <Boxes className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">DataForge</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#databases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Databases
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Start free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Query Generation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Query every database
            <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              from one platform
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Connect to BigQuery, Snowflake, Databricks, and more. Build queries visually,
            execute at scale, and orchestrate complex data workflows—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start for free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="px-8">
                <Play className="h-4 w-4 mr-2" />
                Watch demo
              </Button>
            </Link>
          </div>

          {/* Database logos */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['BigQuery', 'Snowflake', 'Databricks', 'Redshift', 'PostgreSQL'].map((db) => (
              <div key={db} className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-5 w-5" />
                <span className="font-medium">{db}</span>
              </div>
            ))}
          </div>

          {/* Hero Screenshot */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/30 p-1">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-500/5 to-cyan-600/5 p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary mb-4">
                    <Code className="h-5 w-5" />
                    SQL Query Editor
                  </div>
                  <p className="text-muted-foreground">Interactive query builder with AI assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10B+', label: 'Rows processed daily' },
              { value: '5ms', label: 'Avg query latency' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '500+', label: 'Teams trust us' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need for data operations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple queries to complex ETL pipelines, DataForge handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: 'Universal Connectivity',
                description: 'Connect to any major data warehouse. BigQuery, Snowflake, Databricks, Redshift, and PostgreSQL supported.',
              },
              {
                icon: Code,
                title: 'Visual Query Builder',
                description: 'Build complex SQL queries with our visual editor. Drag-and-drop joins, filters, and aggregations.',
              },
              {
                icon: Sparkles,
                title: 'AI Query Generation',
                description: 'Describe what you need in plain English. Our AI writes optimized SQL for your specific database.',
              },
              {
                icon: GitBranch,
                title: 'Workflow Orchestration',
                description: 'Chain queries with dependencies. Schedule complex pipelines and monitor execution in real-time.',
              },
              {
                icon: Clock,
                title: 'Job Scheduling',
                description: 'Run queries on any schedule. Cron expressions, intervals, and event-driven triggers supported.',
              },
              {
                icon: BarChart3,
                title: 'Cost Analytics',
                description: 'Track query costs across all databases. Set budgets, alerts, and optimize spending automatically.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 mb-4">
                    <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Database Support */}
      <section id="databases" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Connect to your data stack</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              First-class support for all major data warehouses and databases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'BigQuery', icon: '🔵', desc: 'Google Cloud' },
              { name: 'Snowflake', icon: '❄️', desc: 'Cloud Data' },
              { name: 'Databricks', icon: '🧱', desc: 'Lakehouse' },
              { name: 'Redshift', icon: '🔴', desc: 'AWS' },
              { name: 'PostgreSQL', icon: '🐘', desc: 'Open Source' },
            ].map((db) => (
              <div key={db.name} className="p-6 rounded-xl border bg-card text-center hover:border-primary/50 transition-colors">
                <div className="text-4xl mb-3">{db.icon}</div>
                <h3 className="font-semibold mb-1">{db.name}</h3>
                <p className="text-sm text-muted-foreground">{db.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, usage-based pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pay only for what you use. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                description: 'For small teams getting started',
                features: ['3 database connections', '10,000 queries/month', 'Basic job scheduling', 'Email support'],
              },
              {
                name: 'Professional',
                price: '$199',
                description: 'For growing data teams',
                features: ['Unlimited connections', '100,000 queries/month', 'Advanced workflows', 'AI query assistant', 'Priority support', 'SSO'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: ['Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option', 'Custom contracts'],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-xl border bg-card ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-teal-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 to-cyan-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to unify your data operations?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join hundreds of data teams already using DataForge to streamline their workflows.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="px-8">
              Start your free trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                  <Boxes className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">DataForge</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern platform for data teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              © 2024 DataForge. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
