import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole, ChildInfo } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  children: ChildInfo[];
  selectedChild: ChildInfo | null;
  setSelectedChild: (child: ChildInfo) => void;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: childrenProp }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [childrenList, setChildrenList] = useState<ChildInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, []);

  const ensureProfile = useCallback(async (authUser: User) => {
    const existingProfile = await fetchProfile(authUser.id);
    if (existingProfile) {
      return existingProfile;
    }

    const metadata = authUser.user_metadata as { full_name?: string; role?: UserRole } | undefined;
    const fullName = metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'New User';
    const role: UserRole = (metadata?.role === 'parent' || metadata?.role === 'teacher') ? metadata.role : 'student';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        full_name: fullName,
        email: authUser.email ?? '',
        role,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating profile:', error.message);
      return null;
    }

    return data as Profile;
  }, [fetchProfile]);

  const fetchChildren = useCallback(async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          student_id,
          profiles!student_parents_student_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('parent_id', parentId);

      if (error) {
        console.error('Error fetching children:', error.message);
        return [];
      }

      const kids = (data || []).map((item: any) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        avatar_url: item.profiles.avatar_url,
      }));
      return kids;
    } catch (err) {
      console.error('Error in fetchChildren:', err);
      return [];
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) {
      setProfile(p);
      if (p.role === 'parent') {
        const kids = await fetchChildren(user.id);
        setChildrenList(kids);
        if (kids.length > 0 && !selectedChild) {
          setSelectedChild(kids[0]);
        }
      }
    }
  }, [user, fetchProfile, fetchChildren, selectedChild]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setChildrenList([]);
          setSelectedChild(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        setIsLoading(true);
        const p = await ensureProfile(user);
        if (p) {
          setProfile(p);
          if (p.role === 'parent') {
            const kids = await fetchChildren(user.id);
            setChildrenList(kids);
            if (kids.length > 0) {
              setSelectedChild(kids[0]);
            }
          }
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [user, ensureProfile, fetchChildren]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedFullName,
          role,
        },
      },
    });
    if (error) return { error: error.message };

    if (data.user && data.session) {
      const profile = await ensureProfile(data.user);
      if (!profile) {
        return { error: 'Account created, but profile setup failed. Please sign in again.' };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setChildrenList([]);
    setSelectedChild(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: profile?.role ?? null,
        children: childrenList,
        selectedChild,
        setSelectedChild,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {childrenProp}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
