import { redirect } from "next/navigation";

/** よくある typo 用 */
export default function AdminAccountsTypoRedirect() {
  redirect("/admin/accounts");
}
