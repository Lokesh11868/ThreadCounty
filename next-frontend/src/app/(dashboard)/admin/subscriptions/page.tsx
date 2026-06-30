"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/apiClient";
import {
  CreditCard, Search, Filter, ArrowUpRight, ArrowDownRight, Edit, User,
  CheckCircle2, XCircle, Zap, Shield, Crown, IndianRupee, Activity, Settings, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const INITIAL_PLANS = [
  { id: "free", name: "Free", price: "₹0", icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", limit: 5 },
  { id: "student", name: "Student", price: "₹750/mo", icon: User, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", limit: 20 },
  { id: "professional", name: "Professional", price: "₹2,490/mo", icon: Shield, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20", limit: 100 },
  { id: "enterprise", name: "Enterprise", price: "₹8,290/mo", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", limit: 1000 },
];

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [editPlanData, setEditPlanData] = useState({ limit: 0, price: "" });

  const [editUser, setEditUser] = useState<any>(null);
  const [newPlan, setNewPlan] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllUsers({ limit: 200 });
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading subscribers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateSubscription = async () => {
    if (!editUser || !newPlan) return;
    try {
      setIsUpdating(true);
      const limit = plans.find(p => p.id === newPlan)?.limit || 5;
      await adminApi.updateUserSubscription(editUser.id, {
        plan: newPlan,
        uploads_limit: limit,
        status: "active"
      });
      toast({ title: "Subscription updated successfully" });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Error updating subscription", description: e.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
      setEditUser(null);
    }
  };

  const handleSavePlan = () => {
    if (!editPlan) return;
    setPlans(plans.map(p => p.id === editPlan.id ? { ...p, limit: editPlanData.limit, price: editPlanData.price } : p));
    toast({ title: "Plan updated successfully" });
    setEditPlan(null);
  };

  const subscribers = users.filter(u => u.subscriptions && u.subscriptions.plan !== 'free');
  
  const filteredUsers = users.filter((u) => {
    const matchesSearch = (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(search.toLowerCase());
    const userPlan = u.subscriptions?.plan || "free";
    const matchesPlan = planFilter === "all" || userPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const mrr = subscribers.reduce((acc, user) => {
    const plan = user.subscriptions?.plan;
    if (plan === "student") return acc + 750;
    if (plan === "professional") return acc + 2490;
    if (plan === "enterprise") return acc + 8290;
    return acc;
  }, 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Subscription Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage plans, limits, and user subscriptions.</p>
        </div>
      </div>

      {/* Revenue & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <IndianRupee className="w-4 h-4 text-green-500" /> Monthly Revenue (MRR)
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>₹{mrr}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="w-4 h-4 text-blue-500" /> Active Subscribers
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{subscribers.length}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Crown className="w-4 h-4 text-amber-500" /> Enterprise Accounts
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {subscribers.filter(u => u.subscriptions?.plan === 'enterprise').length}
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" /> Free Users
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {users.length - subscribers.length}
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-card rounded-2xl border border-border p-5 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <plan.icon className={`w-16 h-16 ${plan.color}`} />
              </div>
              <div className={`w-10 h-10 ${plan.bg} border ${plan.border} rounded-xl flex items-center justify-center mb-3`}>
                <plan.icon className={`w-5 h-5 ${plan.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
              <div className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>{plan.price}</div>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {plan.limit} Uploads/mo</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> AI Analysis</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Standard Support</div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => {
                  setEditPlan(plan);
                  setEditPlanData({ limit: plan.limit, price: plan.price });
                }}
              >
                Edit Plan Limits
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by user or email..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px] bg-background border-input capitalize">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map(p => (
                  <SelectItem key={p.id} value={p.id} className="capitalize">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const planId = user.subscriptions?.plan || "free";
                  const planDetails = plans.find(p => p.id === planId) || plans[0];
                  
                  return (
                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-xs border border-border">
                            {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.full_name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={`capitalize ${planDetails.bg} ${planDetails.color} ${planDetails.border}`}>
                          <planDetails.icon className="w-3 h-3 mr-1" />
                          {planDetails.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${planDetails.bg.replace('/10', '')}`}
                              style={{ width: `${Math.min(100, ((user.subscriptions?.uploads_used || 0) / planDetails.limit) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {user.subscriptions?.uploads_used || 0} / {planDetails.limit}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-500 bg-teal-500/10 px-2 py-1 rounded-md capitalize">
                          <CheckCircle2 className="w-3 h-3" /> {user.subscriptions?.status || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                              <User className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" size="sm" 
                            onClick={() => { setEditUser(user); setNewPlan(planId); }}
                            className="text-xs h-8"
                          >
                            <Settings className="w-3.5 h-3.5 mr-1" /> Edit Plan
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Subscription</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {editUser?.full_name || editUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Plan</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newPlan && (
              <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 text-sm">
                Limits will be updated to <span className="font-bold">{plans.find(p => p.id === newPlan)?.limit}</span> uploads per month.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleUpdateSubscription} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Plan Edit Modal */}
      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan Limits: {editPlan?.name}</DialogTitle>
            <DialogDescription>
              Update the monthly limits and pricing for this plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Uploads Limit</label>
              <Input 
                type="number" 
                value={editPlanData.limit}
                onChange={(e) => setEditPlanData({ ...editPlanData, limit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Pricing</label>
              <Input 
                type="text" 
                value={editPlanData.price}
                onChange={(e) => setEditPlanData({ ...editPlanData, price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={handleSavePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
