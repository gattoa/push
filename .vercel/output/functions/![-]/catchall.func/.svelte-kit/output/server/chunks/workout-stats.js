function epley1RM(weight, reps) {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
function getTrainingDays(week) {
  return week.days.filter((d) => !d.is_rest_day);
}
function isDayCompleted(day, exercises, setLogs) {
  const dayExercises = exercises.filter((e) => e.planned_day_id === day.id);
  if (dayExercises.length === 0) return false;
  const daySets = setLogs.filter((s) => dayExercises.some((e) => e.id === s.planned_exercise_id));
  return daySets.length > 0 && daySets.some((s) => s.completed);
}
function computeDayDate(weekStart, dayOfWeek) {
  const d = /* @__PURE__ */ new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + dayOfWeek);
  return d.toISOString().split("T")[0];
}
function computeWeekStats(week) {
  const trainingDays = getTrainingDays(week);
  const workoutsTotal = trainingDays.length;
  let workoutsCompleted = 0;
  for (const day of trainingDays) {
    if (isDayCompleted(day, week.exercises, week.setLogs)) {
      workoutsCompleted++;
    }
  }
  const setsTotal = week.plannedSets.length;
  const completedSets = week.setLogs.filter((s) => s.completed);
  const setsCompleted = completedSets.length;
  let volume = 0;
  for (const s of completedSets) {
    if (s.actual_weight !== null && s.actual_reps !== null) {
      volume += s.actual_weight * s.actual_reps;
    }
  }
  return { workoutsCompleted, workoutsTotal, setsCompleted, setsTotal, volume };
}
function computeStreak(weeks) {
  const allDays = [];
  for (const week of weeks) {
    const trainingDays = getTrainingDays(week).sort((a, b) => a.day_of_week - b.day_of_week);
    for (const day of trainingDays) {
      allDays.push({
        completed: isDayCompleted(day, week.exercises, week.setLogs)
      });
    }
  }
  let current = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].completed) {
      current++;
    } else {
      break;
    }
  }
  let best = 0;
  let run = 0;
  for (const day of allDays) {
    if (day.completed) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return { current, best };
}
function computePersonalRecords(weeks) {
  const bestByExercise = /* @__PURE__ */ new Map();
  for (const week of weeks) {
    for (const setLog of week.setLogs) {
      if (!setLog.completed || setLog.actual_weight === null || setLog.actual_reps === null) continue;
      if (setLog.actual_weight === 0) continue;
      const exercise = week.exercises.find((e) => e.id === setLog.planned_exercise_id);
      if (!exercise) continue;
      const est1RM = epley1RM(setLog.actual_weight, setLog.actual_reps);
      const existing = bestByExercise.get(exercise.exercise_name);
      if (!existing || est1RM > existing.estimated1RM) {
        bestByExercise.set(exercise.exercise_name, {
          exerciseName: exercise.exercise_name,
          estimated1RM: Math.round(est1RM),
          weight: setLog.actual_weight,
          reps: setLog.actual_reps,
          weekStart: week.weekStart
        });
      }
    }
  }
  return Array.from(bestByExercise.values()).sort((a, b) => b.estimated1RM - a.estimated1RM).slice(0, 5);
}
function computeWeekPRs(weekIndex, weeks) {
  if (weekIndex === 0) {
    return computePersonalRecords([weeks[0]]).slice(0, 3);
  }
  const previousWeeks = weeks.slice(0, weekIndex);
  const currentWeek = weeks[weekIndex];
  const previousPRs = computePersonalRecords(previousWeeks);
  const previousBest = new Map(previousPRs.map((pr) => [pr.exerciseName, pr.estimated1RM]));
  const newPRs = [];
  for (const setLog of currentWeek.setLogs) {
    if (!setLog.completed || setLog.actual_weight === null || setLog.actual_reps === null) continue;
    if (setLog.actual_weight === 0) continue;
    const exercise = currentWeek.exercises.find((e) => e.id === setLog.planned_exercise_id);
    if (!exercise) continue;
    const est1RM = epley1RM(setLog.actual_weight, setLog.actual_reps);
    const prev = previousBest.get(exercise.exercise_name) ?? 0;
    if (est1RM > prev) {
      const existing = newPRs.find((pr) => pr.exerciseName === exercise.exercise_name);
      if (!existing || est1RM > existing.estimated1RM) {
        const idx = newPRs.findIndex((pr) => pr.exerciseName === exercise.exercise_name);
        const record = {
          exerciseName: exercise.exercise_name,
          estimated1RM: Math.round(est1RM),
          weight: setLog.actual_weight,
          reps: setLog.actual_reps,
          weekStart: currentWeek.weekStart
        };
        if (idx >= 0) {
          newPRs[idx] = record;
        } else {
          newPRs.push(record);
        }
      }
    }
  }
  return newPRs.sort((a, b) => b.estimated1RM - a.estimated1RM);
}
function computeLifetimeStats(weeks) {
  let totalWorkouts = 0;
  let totalVolume = 0;
  for (const week of weeks) {
    const stats = computeWeekStats(week);
    totalWorkouts += stats.workoutsCompleted;
    totalVolume += stats.volume;
  }
  const { best: longestStreak } = computeStreak(weeks);
  return {
    totalWorkouts,
    totalVolume,
    longestStreak,
    weeksActive: weeks.length
  };
}
function convertWeight(lbs, units) {
  return units === "kg" ? Math.round(lbs * 0.453592) : lbs;
}
function computeCalendarWeeks(weeks) {
  return weeks.map((week, weekIndex) => {
    const stats = computeWeekStats(week);
    const prs = computeWeekPRs(weekIndex, weeks);
    const daysByDow = new Map(week.days.map((d) => [d.day_of_week, d]));
    const days = [];
    for (let dow = 0; dow < 7; dow++) {
      const day = daysByDow.get(dow);
      if (!day) {
        days.push({
          dayOfWeek: dow,
          date: computeDayDate(week.weekStart, dow),
          label: "",
          isRestDay: true,
          isCompleted: false,
          exercises: []
        });
        continue;
      }
      const dayExercises = week.exercises.filter((e) => e.planned_day_id === day.id).sort((a, b) => a.order - b.order);
      const exercises = dayExercises.map((ex) => {
        const exSetLogs = week.setLogs.filter((s) => s.planned_exercise_id === ex.id).sort((a, b) => a.set_number - b.set_number);
        const sets = exSetLogs.map((s) => ({
          setNumber: s.set_number,
          weight: s.actual_weight,
          reps: s.actual_reps,
          completed: s.completed
        }));
        const allCompleted = sets.length > 0 && sets.every((s) => s.completed);
        return {
          exerciseName: ex.exercise_name,
          exercisedbId: ex.exercisedb_id,
          sets,
          allCompleted
        };
      });
      const isCompleted = day.is_rest_day ? false : isDayCompleted(day, week.exercises, week.setLogs);
      days.push({
        dayOfWeek: dow,
        date: computeDayDate(week.weekStart, dow),
        label: day.label,
        isRestDay: day.is_rest_day,
        isCompleted,
        exercises
      });
    }
    return {
      weekNumber: week.weekNumber,
      weekStart: week.weekStart,
      isCurrent: weekIndex === weeks.length - 1,
      days,
      totalVolume: stats.volume,
      prsHit: prs
    };
  });
}
function computeWeekMomentum(weeks, todayIndex) {
  const currentWeek = weeks[weeks.length - 1];
  const stats = computeWeekStats(currentWeek);
  const streak = computeStreak(weeks);
  const weekIdx = weeks.length - 1;
  const weekPRs = computeWeekPRs(weekIdx, weeks);
  const bodyPartsHit = /* @__PURE__ */ new Map();
  const bodyPartExercises = /* @__PURE__ */ new Map();
  const bodyPartsScheduled = /* @__PURE__ */ new Map();
  const unmappedSet = /* @__PURE__ */ new Set();
  const allBodyParts = /* @__PURE__ */ new Set();
  const dayCompletions = currentWeek.days.sort((a, b) => a.day_of_week - b.day_of_week).map((day) => {
    const dayExercises = currentWeek.exercises.filter((e) => e.planned_day_id === day.id);
    const isCompleted = !day.is_rest_day && isDayCompleted(day, currentWeek.exercises, currentWeek.setLogs);
    const dayBodyParts = /* @__PURE__ */ new Set();
    let volume = 0;
    for (const ex of dayExercises) {
      for (const bp of ex.body_parts) allBodyParts.add(bp.toUpperCase());
      if (ex.body_parts.length === 0 && !day.is_rest_day) {
        unmappedSet.add(ex.exercise_name);
      }
    }
    if (!day.is_rest_day) {
      for (const ex of dayExercises) {
        const exSetLogs = currentWeek.setLogs.filter(
          (s) => s.planned_exercise_id === ex.id && s.completed
        );
        if (exSetLogs.length > 0) {
          for (const s of exSetLogs) {
            if (s.actual_weight !== null && s.actual_reps !== null) {
              volume += s.actual_weight * s.actual_reps;
            }
          }
          for (const rawBp of ex.body_parts) {
            const bp = rawBp.toUpperCase();
            dayBodyParts.add(bp);
            bodyPartsHit.set(bp, (bodyPartsHit.get(bp) ?? 0) + exSetLogs.length);
            if (!bodyPartExercises.has(bp)) bodyPartExercises.set(bp, []);
            bodyPartExercises.get(bp).push({
              exerciseName: ex.exercise_name,
              sets: exSetLogs.length,
              exercisedbId: ex.exercisedb_id
            });
          }
        } else if (todayIndex !== void 0 && day.day_of_week >= todayIndex) {
          for (const rawBp of ex.body_parts) {
            const bp = rawBp.toUpperCase();
            if (!bodyPartsScheduled.has(bp)) bodyPartsScheduled.set(bp, []);
            bodyPartsScheduled.get(bp).push({
              exerciseName: ex.exercise_name,
              dayLabel: day.label,
              exercisedbId: ex.exercisedb_id
            });
          }
        }
      }
    }
    return {
      dayOfWeek: day.day_of_week,
      label: day.label,
      completed: isCompleted,
      bodyParts: Array.from(dayBodyParts),
      volume,
      isRestDay: day.is_rest_day,
      exerciseNames: dayExercises.sort((a, b) => a.order - b.order).map((e) => e.exercise_name)
    };
  });
  return {
    weekStart: currentWeek.weekStart,
    workoutsCompleted: stats.workoutsCompleted,
    workoutsTotal: stats.workoutsTotal,
    bodyPartsHit,
    totalBodyParts: allBodyParts.size,
    bodyPartsHitCount: bodyPartsHit.size,
    bodyPartExercises,
    bodyPartsScheduled,
    unmappedExercises: Array.from(unmappedSet),
    dayCompletions,
    streak: streak.current,
    weekPRs
  };
}
export {
  computePersonalRecords as a,
  computeStreak as b,
  computeCalendarWeeks as c,
  computeLifetimeStats as d,
  convertWeight as e,
  computeWeekMomentum as f
};
