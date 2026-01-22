import { PolicyDecision } from "types";



export async function checkPolicyBulk(
  licenseId: string,
  employeeIds: string[],
): Promise<{ employeeId: string; decision: PolicyDecision }[]> {
  // เดโม: ให้สุ่ม policy
  return employeeIds.map(id => {
    const rnd = Math.random();
    const decision: PolicyDecision =
      rnd < 0.7 ? "Allowed" : rnd < 0.9 ? "NeedsReview" : "Restricted";
    return { employeeId: id, decision };
  });
}
