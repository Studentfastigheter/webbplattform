"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type School = { id: number; name: string; city?: string; latitude?: number; longitude?: number };

type Ctx = {
  school: School | null;
  setSchool: (s: School | null) => void;
};

const SchoolCtx = createContext<Ctx | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [school, setSchoolState] = useState<School | null>(null);

  useEffect(() => {
    if (user?.schoolId && user?.schoolName) {
      setSchoolState({ id: user.schoolId, name: user.schoolName });
    }
  }, [user?.schoolId, user?.schoolName]);

  const setSchool = async (s: School | null) => {
    setSchoolState(s);
    if (s && token) {
      try {
        const res = await fetch(`/api/users/me/school?schoolId=${s.id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
        // ignore response; AuthContext will still hold previous user until next refresh/login
      } catch {}
    }
  };

  return <SchoolCtx.Provider value={{ school, setSchool }}>{children}</SchoolCtx.Provider>;
}

export function useSchool() {
  const ctx = useContext(SchoolCtx);
  if (!ctx) throw new Error('useSchool must be used within SchoolProvider');
  return ctx;
}
