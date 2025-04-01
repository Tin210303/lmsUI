import React, { createContext, useState } from "react";

export const StudyPlanContext = createContext();

export const StudyPlanProvider = ({ children }) => {
  const [studyPlan, setStudyPlan] = useState([]);

  return (
    <StudyPlanContext.Provider value={{ studyPlan, setStudyPlan }}>
      {children}
    </StudyPlanContext.Provider>
  );
};
