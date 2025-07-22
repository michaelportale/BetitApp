import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          push_token: string | null;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          creator_id: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          creator_id: string;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          creator_id?: string;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          group_id: string;
          creator_id: string;
          title: string;
          description: string;
          side_a: string;
          side_b: string;
          stake: number;
          event_date: string;
          status:
            | 'draft'
            | 'pending'
            | 'locked'
            | 'awaiting_proof'
            | 'voting'
            | 'resolved'
            | 'void';
          proof_type: 'vote' | 'arbiter';
          arbiter_id: string | null;
          winner_side: 'A' | 'B' | null;
          proof_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          creator_id: string;
          title: string;
          description: string;
          side_a: string;
          side_b: string;
          stake: number;
          event_date: string;
          status?:
            | 'draft'
            | 'pending'
            | 'locked'
            | 'awaiting_proof'
            | 'voting'
            | 'resolved'
            | 'void';
          proof_type: 'vote' | 'arbiter';
          arbiter_id?: string | null;
          winner_side?: 'A' | 'B' | null;
          proof_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          side_a?: string;
          side_b?: string;
          stake?: number;
          event_date?: string;
          status?:
            | 'draft'
            | 'pending'
            | 'locked'
            | 'awaiting_proof'
            | 'voting'
            | 'resolved'
            | 'void';
          proof_type?: 'vote' | 'arbiter';
          arbiter_id?: string | null;
          winner_side?: 'A' | 'B' | null;
          proof_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bet_participants: {
        Row: {
          id: string;
          bet_id: string;
          user_id: string;
          side: 'A' | 'B';
          accepted_at: string;
        };
        Insert: {
          id?: string;
          bet_id: string;
          user_id: string;
          side: 'A' | 'B';
          accepted_at?: string;
        };
        Update: {
          id?: string;
          bet_id?: string;
          user_id?: string;
          side?: 'A' | 'B';
          accepted_at?: string;
        };
      };
      bet_votes: {
        Row: {
          id: string;
          bet_id: string;
          user_id: string;
          winning_side: 'A' | 'B';
          created_at: string;
        };
        Insert: {
          id?: string;
          bet_id: string;
          user_id: string;
          winning_side: 'A' | 'B';
          created_at?: string;
        };
        Update: {
          id?: string;
          bet_id?: string;
          user_id?: string;
          winning_side?: 'A' | 'B';
          created_at?: string;
        };
      };
      ledger: {
        Row: {
          id: string;
          user_id: string;
          bet_id: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bet_id: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bet_id?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'bet_invite' | 'proof_submitted' | 'bet_resolved' | 'vote_needed' | 'group_joined';
          title: string;
          message: string;
          data: Record<string, any>;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'bet_invite' | 'proof_submitted' | 'bet_resolved' | 'vote_needed' | 'group_joined';
          title: string;
          message: string;
          data?: Record<string, any>;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'bet_invite' | 'proof_submitted' | 'bet_resolved' | 'vote_needed' | 'group_joined';
          title?: string;
          message?: string;
          data?: Record<string, any>;
          read?: boolean;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          stripe_transfer_id: string | null;
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
          description: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_transfer_id?: string | null;
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
          description?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_transfer_id?: string | null;
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
          description?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_ledger_entries: {
        Row: {
          id: string;
          payment_id: string;
          ledger_entry_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          ledger_entry_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          ledger_entry_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      join_group_with_invite_code: {
        Args: {
          invite_code: string;
        };
        Returns: {
          id: string;
          name: string;
          creator_id: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        }[];
      };
      check_bet_votes: {
        Args: {
          bet_id: string;
        };
        Returns: {
          total_votes: number;
          side_a_votes: number;
          side_b_votes: number;
          is_resolved: boolean;
          winning_side: 'A' | 'B' | null;
        };
      };
      resolve_bet: {
        Args: {
          bet_id: string;
          winning_side: 'A' | 'B';
        };
        Returns: void;
      };
      get_user_balance: {
        Args: {
          user_id: string;
        };
        Returns: number;
      };
      get_user_unpaid_balance: {
        Args: {
          user_id_param: string;
        };
        Returns: number;
      };
      create_payment: {
        Args: {
          user_id_param: string;
          amount_param: number;
          stripe_payment_intent_id_param: string;
          description_param?: string;
          metadata_param?: Record<string, any>;
        };
        Returns: string;
      };
      update_payment_status: {
        Args: {
          stripe_payment_intent_id_param: string;
          status_param: string;
          stripe_transfer_id_param?: string;
        };
        Returns: boolean;
      };
    };
  };
};

// SQL to create the tables and RLS policies:
/*
-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- RLS Policies for groups table
CREATE POLICY "Users can view groups they are members of" ON groups
FOR SELECT USING (
  id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" ON groups
FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Group creators can update their groups" ON groups
FOR UPDATE USING (creator_id = auth.uid());

-- RLS Policies for group_members table  
CREATE POLICY "Users can view group memberships for groups they belong to" ON group_members
FOR SELECT USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups with valid invite codes" ON group_members
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND 
  group_id IN (SELECT id FROM groups WHERE invite_code IS NOT NULL)
);

-- Function to join group with invite code
CREATE OR REPLACE FUNCTION join_group_with_invite_code(invite_code TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  creator_id UUID,
  invite_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  group_record RECORD;
BEGIN
  -- Find the group by invite code
  SELECT * INTO group_record FROM groups WHERE groups.invite_code = join_group_with_invite_code.invite_code;
  
  -- Check if group exists
  IF group_record IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_record.id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;
  
  -- Add user to group
  INSERT INTO group_members (group_id, user_id) 
  VALUES (group_record.id, auth.uid());
  
  -- Return the group
  RETURN QUERY
  SELECT 
    group_record.id,
    group_record.name,
    group_record.creator_id,
    group_record.invite_code,
    group_record.created_at,
    group_record.updated_at;
END;
$$;

-- Add indexes for performance
CREATE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);

-- Trigger to automatically add creator as member
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id) VALUES (NEW.id, NEW.creator_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_creator_as_member
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- BETTING TABLES --

-- Enable RLS for betting tables
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Create betting tables
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  side_a TEXT NOT NULL,
  side_b TEXT NOT NULL,
  stake INTEGER NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'locked', 'awaiting_proof', 'voting', 'resolved', 'void')),
  proof_type TEXT NOT NULL CHECK (proof_type IN ('vote', 'arbiter')),
  arbiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_side TEXT CHECK (winner_side IN ('A', 'B')),
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bet_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('A', 'B')),
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bet_id, user_id)
);

CREATE TABLE bet_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  winning_side TEXT NOT NULL CHECK (winning_side IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bet_id, user_id)
);

CREATE TABLE ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- negative for losses, positive for wins
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for bets table
CREATE POLICY "Users can view bets in their groups" ON bets
FOR SELECT USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Group members can create bets" ON bets
FOR INSERT WITH CHECK (
  creator_id = auth.uid() AND
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Bet creators can update their bets" ON bets
FOR UPDATE USING (creator_id = auth.uid());

-- RLS Policies for bet_participants table
CREATE POLICY "Users can view participants for bets in their groups" ON bet_participants
FOR SELECT USING (
  bet_id IN (
    SELECT id FROM bets WHERE group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Group members can join bets" ON bet_participants
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  bet_id IN (
    SELECT id FROM bets WHERE group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for bet_votes table
CREATE POLICY "Users can view votes for bets in their groups" ON bet_votes
FOR SELECT USING (
  bet_id IN (
    SELECT id FROM bets WHERE group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Group members can vote on bets" ON bet_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  bet_id IN (
    SELECT id FROM bets WHERE group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own votes" ON bet_votes
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for ledger_entries table
CREATE POLICY "Users can view their own ledger entries" ON ledger_entries
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create ledger entries" ON ledger_entries
FOR INSERT WITH CHECK (true); -- Only functions can insert

-- BETTING FUNCTIONS --

-- Function to check votes and potentially resolve bet
CREATE OR REPLACE FUNCTION check_bet_votes(bet_id UUID)
RETURNS TABLE(
  total_votes INTEGER,
  side_a_votes INTEGER,
  side_b_votes INTEGER,
  is_resolved BOOLEAN,
  winning_side TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bet_record RECORD;
  participant_count INTEGER;
  vote_count_a INTEGER;
  vote_count_b INTEGER;
  total_vote_count INTEGER;
  majority_threshold INTEGER;
  winner TEXT DEFAULT NULL;
  resolved BOOLEAN DEFAULT FALSE;
BEGIN
  -- Get bet details
  SELECT * INTO bet_record FROM bets WHERE id = bet_id AND status = 'voting';
  
  IF bet_record IS NULL THEN
    RAISE EXCEPTION 'Bet not found or not in voting state';
  END IF;
  
  -- Count participants (excluding creator)
  SELECT COUNT(*) INTO participant_count 
  FROM bet_participants 
  WHERE bet_participants.bet_id = check_bet_votes.bet_id;
  
  -- Count votes by side
  SELECT 
    COUNT(*) FILTER (WHERE winning_side = 'A'),
    COUNT(*) FILTER (WHERE winning_side = 'B'),
    COUNT(*)
  INTO vote_count_a, vote_count_b, total_vote_count
  FROM bet_votes 
  WHERE bet_votes.bet_id = check_bet_votes.bet_id;
  
  -- Calculate majority threshold (more than half of participants)
  majority_threshold := (participant_count / 2) + 1;
  
  -- Check if we have a majority
  IF vote_count_a >= majority_threshold THEN
    winner := 'A';
    resolved := TRUE;
  ELSIF vote_count_b >= majority_threshold THEN
    winner := 'B';
    resolved := TRUE;
  END IF;
  
  -- If resolved, update the bet
  IF resolved THEN
    PERFORM resolve_bet(check_bet_votes.bet_id, winner);
  END IF;
  
  -- Return vote summary
  RETURN QUERY SELECT 
    total_vote_count,
    vote_count_a,
    vote_count_b,
    resolved,
    winner;
END;
$$;

-- Function to resolve bet and handle payouts
CREATE OR REPLACE FUNCTION resolve_bet(bet_id UUID, winning_side TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bet_record RECORD;
  participant RECORD;
  stake_amount INTEGER;
  total_participants INTEGER;
  winners_count INTEGER;
  payout_per_winner INTEGER;
BEGIN
  -- Get bet details
  SELECT * INTO bet_record FROM bets WHERE id = bet_id;
  
  IF bet_record IS NULL THEN
    RAISE EXCEPTION 'Bet not found';
  END IF;
  
  IF bet_record.status = 'resolved' THEN
    RETURN; -- Already resolved
  END IF;
  
  stake_amount := bet_record.stake;
  
  -- Count total participants and winners
  SELECT COUNT(*) INTO total_participants 
  FROM bet_participants 
  WHERE bet_participants.bet_id = resolve_bet.bet_id;
  
  SELECT COUNT(*) INTO winners_count
  FROM bet_participants 
  WHERE bet_participants.bet_id = resolve_bet.bet_id 
  AND side = winning_side;
  
  -- Calculate payout per winner (stake from each loser goes to winners)
  IF winners_count > 0 THEN
    payout_per_winner := (stake_amount * (total_participants - winners_count)) / winners_count;
  END IF;
  
  -- Create ledger entries
  FOR participant IN 
    SELECT user_id, side 
    FROM bet_participants 
    WHERE bet_participants.bet_id = resolve_bet.bet_id
  LOOP
    IF participant.side = winning_side THEN
      -- Winner gets their stake back plus winnings
      INSERT INTO ledger_entries (user_id, bet_id, amount)
      VALUES (participant.user_id, resolve_bet.bet_id, payout_per_winner);
    ELSE
      -- Loser loses their stake
      INSERT INTO ledger_entries (user_id, bet_id, amount)
      VALUES (participant.user_id, resolve_bet.bet_id, -stake_amount);
    END IF;
  END LOOP;
  
  -- Update bet status
  UPDATE bets 
  SET 
    status = 'resolved',
    winner_side = winning_side,
    updated_at = NOW()
  WHERE id = resolve_bet.bet_id;
END;
$$;

-- Add betting table indexes
CREATE INDEX idx_bets_group_id ON bets(group_id);
CREATE INDEX idx_bets_creator_id ON bets(creator_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bet_participants_bet_id ON bet_participants(bet_id);
CREATE INDEX idx_bet_participants_user_id ON bet_participants(user_id);
CREATE INDEX idx_bet_votes_bet_id ON bet_votes(bet_id);
CREATE INDEX idx_bet_votes_user_id ON bet_votes(user_id);
CREATE INDEX idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX idx_ledger_entries_bet_id ON ledger_entries(bet_id);
*/
