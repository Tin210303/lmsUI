import React, { createContext, useState } from "react";

export const StudyPlanContext = createContext();

export const StudyPlanProvider = ({ children }) => {
  const [studyPlan, setStudyPlan] = useState([]);
  const [years, setYears] = useState(0)

  return (
    <StudyPlanContext.Provider value={{ studyPlan, setStudyPlan, years, setYears }}>
      {children}
    </StudyPlanContext.Provider>
  );
};
