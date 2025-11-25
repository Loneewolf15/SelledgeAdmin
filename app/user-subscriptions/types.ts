export interface Subscription {
    subscription_id: string
    user_id: string
    user_name: string
    user_email: string
    plan_id: string
    plan_name: string
    status: 'active' | 'pending' | 'expired' | 'cancelled'
    billing_cycle: string
    amount: string // PHP might return string for decimals
    currency: string
    payment_method: string
    start_date: string
    end_date: string
    next_billing_date: string | null
    auto_renew: number // 0 or 1
    created_at: string
    updated_at: string
}

export interface PaginationData {
    page: number
    limit: number
    total: number
    total_pages: number
}

export interface SubscriptionResponse {
    status: boolean
    message: string
    data: {
        subscriptions: Subscription[]
        pagination: PaginationData
    }
}
