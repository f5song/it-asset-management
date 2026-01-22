
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const StepSeatAllocation: React.FC<{ available: number; required: number }> = ({
  available,
  required,
}) => {
  const lack = Math.max(0, required - available);
  const { getValues, setValue } = useFormContext();
  const seatMode = getValues().seatMode ?? "partial";

  return (
    <section className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-gray-500 text-xs">Seats Required</div>
          <div className="text-xl font-semibold">{required}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-gray-500 text-xs">Seats Available</div>
          <div className="text-xl font-semibold">{available}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-gray-500 text-xs">Status</div>
          {lack > 0 ? (
            <div className="text-red-600 font-semibold">Not enough ({lack} short)</div>
          ) : (
            <div className="text-green-700 font-semibold">OK</div>
          )}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-800">Seat Allocation Mode</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="seatMode"
            checked={seatMode === "partial"}
            onChange={() => setValue("seatMode", "partial")}
          />
          <span>Partial Assignment (recommend)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="seatMode"
            checked={seatMode === "all-or-nothing"}
            onChange={() => setValue("seatMode", "all-or-nothing")}
          />
          <span>Block if insufficient seats</span>
        </label>
      </fieldset>
    </section>
  );
};
