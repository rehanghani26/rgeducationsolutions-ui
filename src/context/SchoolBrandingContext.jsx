import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api.js";

const BRANDING_STORAGE_KEY = "rg_school_branding";

const defaultBranding = {
  schoolLogo: "",
  schoolName: "RG EduCore",
  schoolMotto: "School ERP",
};

const getStoredBranding = () => {
  if (typeof window === "undefined") return defaultBranding;
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        schoolLogo: parsed.schoolLogo || "",
        schoolName: parsed.schoolName || defaultBranding.schoolName,
        schoolMotto: parsed.schoolMotto || defaultBranding.schoolMotto,
      };
    }
  } catch (err) {
    // ignore parse error
  }
  return defaultBranding;
};

const SchoolBrandingContext = createContext(null);

export const SchoolBrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(getStoredBranding);

  const updateBranding = useCallback((newValues) => {
    setBranding((prev) => {
      const updated = {
        schoolLogo:
          newValues.schoolLogo !== undefined
            ? newValues.schoolLogo
            : newValues.companyLogo !== undefined
            ? newValues.companyLogo
            : prev.schoolLogo,
        schoolName:
          newValues.schoolName !== undefined
            ? newValues.schoolName
            : newValues.companyName !== undefined
            ? newValues.companyName
            : prev.schoolName,
        schoolMotto:
          newValues.schoolMotto !== undefined
            ? newValues.schoolMotto
            : prev.schoolMotto,
      };

      try {
        window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore storage quota errors
      }

      window.dispatchEvent(
        new CustomEvent("school_branding_updated", { detail: updated })
      );

      return updated;
    });
  }, []);

  const refreshBranding = useCallback(async () => {
    try {
      // First try /erp/settings if authenticated
      const res = await api.get("/erp/settings").catch(() => null);
      if (res?.data?.settings) {
        const s = res.data.settings;
        const logo = s.companyLogo || s.schoolLogo || "";
        const name = s.schoolName || defaultBranding.schoolName;
        const motto = s.schoolMotto || defaultBranding.schoolMotto;
        updateBranding({ schoolLogo: logo, schoolName: name, schoolMotto: motto });
        return;
      }

      // Otherwise fall back to public /company/profile
      const compRes = await api.get("/company/profile").catch(() => null);
      if (compRes?.data?.company) {
        const c = compRes.data.company;
        const logo = c.companyLogo || c.schoolLogo || "";
        const name = c.schoolName || c.companyName || defaultBranding.schoolName;
        const motto = c.schoolMotto || defaultBranding.schoolMotto;
        updateBranding({ schoolLogo: logo, schoolName: name, schoolMotto: motto });
      }
    } catch {
      // ignore
    }
  }, [updateBranding]);

  useEffect(() => {
    refreshBranding();

    const handleSync = (e) => {
      if (e?.detail) {
        setBranding((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener("school_branding_updated", handleSync);
    return () => window.removeEventListener("school_branding_updated", handleSync);
  }, [refreshBranding]);

  const value = useMemo(
    () => ({
      ...branding,
      updateBranding,
      refreshBranding,
    }),
    [branding, updateBranding, refreshBranding]
  );

  return (
    <SchoolBrandingContext.Provider value={value}>
      {children}
    </SchoolBrandingContext.Provider>
  );
};

export const useSchoolBranding = () => {
  const context = useContext(SchoolBrandingContext);
  if (!context) {
    return {
      ...getStoredBranding(),
      updateBranding: () => {},
      refreshBranding: () => {},
    };
  }
  return context;
};

export default SchoolBrandingContext;
