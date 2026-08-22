import { useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldAlert, UserRound, X } from "lucide-react";
import { supabase, supabaseIsConfigured } from "../lib/supabase";

type Registration = { familyName: string; givenName: string; gender: "" | "male" | "female"; email: string; phone: string; password: string; confirmPassword: string };
const empty: Registration = { familyName: "", givenName: "", gender: "", email: "", phone: "", password: "", confirmPassword: "" };
const input = "mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm outline-none focus:border-emerald-600";
const passwordValid = (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

export default function AuthDialog({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (username: string) => void }) {
  const [register, setRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [form, setForm] = useState<Registration>(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("error");
  const [submitting, setSubmitting] = useState(false);
  const swipeStartY = useRef<number | null>(null);
  const change = (key: keyof Registration, value: string) => setForm(current => ({ ...current, [key]: value }));

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { setMessageKind("error"); return setMessage("请先配置 Supabase 环境变量。"); }
    setSubmitting(true); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
    setSubmitting(false);
    if (error || !data.user) { setMessageKind("error"); return setMessage("邮箱或密码不正确。"); }
    const displayName = typeof data.user.user_metadata.given_name === "string" ? data.user.user_metadata.given_name : loginEmail.trim();
    onAuthenticated(displayName); onClose();
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { setMessageKind("error"); return setMessage("请先配置 Supabase 环境变量。"); }
    if (!passwordValid(form.password)) { setMessageKind("error"); return setMessage("密码必须同时包含大写字母、小写字母和数字。"); }
    if (form.password !== form.confirmPassword) { setMessageKind("error"); return setMessage("两次输入的密码不一致。"); }
    setSubmitting(true); setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(), password: form.password,
      options: { data: { family_name: form.familyName.trim(), given_name: form.givenName.trim(), gender: form.gender, phone: form.phone.trim() } },
    });
    setSubmitting(false);
    if (error) {
      setMessageKind("error");
      if (/already registered|already exists|duplicate/i.test(error.message)) {
        return setMessage("该电子邮箱已被注册，请直接登录或更换邮箱。");
      }
      return setMessage(error.message);
    }
    // Supabase may intentionally return an obfuscated success response for an
    // existing email to prevent account enumeration.  It has no identities,
    // so treat it as a duplicate instead of presenting a false registration success.
    if (data.user?.identities?.length === 0) {
      setMessageKind("error");
      return setMessage("该电子邮箱已被注册，请直接登录或更换邮箱。");
    }
    setForm(empty);
    if (data.session) { onAuthenticated(form.givenName.trim()); onClose(); }
    else { setMessageKind("success"); setMessage("注册成功！请查收邮箱并完成验证后，再用电子邮箱和密码登录。"); }
  };

  const onSwipeEnd = (event: React.TouchEvent) => {
    if (swipeStartY.current !== null && swipeStartY.current - event.changedTouches[0].clientY > 70) onClose();
    swipeStartY.current = null;
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
    <div className="relative my-5 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div onTouchStart={event => { swipeStartY.current = event.touches[0].clientY; }} onTouchEnd={onSwipeEnd} className="-mt-3 mb-2 flex cursor-grab touch-none flex-col items-center py-2 active:cursor-grabbing" aria-label="向上滑动关闭">
        <span className="h-1.5 w-11 rounded-full bg-emerald-700/35" />
        <span className="mt-1 text-[10px] text-emerald-800">向上滑动关闭</span>
      </div>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" aria-label="关闭"><X className="h-4 w-4" /></button>
      <div className="mb-5 text-center"><span className="text-2xl">🏔️</span><h2 className="mt-2 text-xl font-extrabold">{register ? "注册新账户" : "登录您的账户"}</h2><p className="mt-1 text-xs text-zinc-500">{register ? "注册后资料会自动安全保存" : "使用电子邮箱和密码登录"}</p></div>
      {!supabaseIsConfigured && <div className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><ShieldAlert className="h-4 w-4 shrink-0" />请先配置 `.env` 中的 Supabase 信息。</div>}
      {register ? <form onSubmit={handleRegister} className="space-y-3">
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-zinc-500">姓<input required value={form.familyName} onChange={e => change("familyName", e.target.value)} className={input} /></label><label className="text-xs font-bold text-zinc-500">名<input required value={form.givenName} onChange={e => change("givenName", e.target.value)} className={input} /></label></div>
        <label className="block text-xs font-bold text-zinc-500">性别<select required value={form.gender} onChange={e => change("gender", e.target.value)} className={input}><option value="" disabled>请选择</option><option value="male">男</option><option value="female">女</option></select></label>
        <label className="block text-xs font-bold text-zinc-500">电子邮箱<input type="email" required value={form.email} onChange={e => change("email", e.target.value)} className={input} /></label>
        <label className="block text-xs font-bold text-zinc-500">电话<input type="tel" required value={form.phone} onChange={e => change("phone", e.target.value)} className={input} /></label>
        <label className="block text-xs font-bold text-zinc-500">密码<div className="relative"><input type={showPassword ? "text" : "password"} required minLength={8} value={form.password} onChange={e => change("password", e.target.value)} className={`${input} pr-11`} /><button type="button" onClick={() => setShowPassword(current => !current)} className="absolute inset-y-0 right-0 mt-1.5 flex w-11 items-center justify-center text-zinc-500 hover:text-emerald-700" aria-label={showPassword ? "隐藏密码" : "显示密码"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><span className="text-[10px] font-normal">至少 8 位，且包含大写字母、小写字母和数字</span></label>
        <label className="block text-xs font-bold text-zinc-500">确认密码<div className="relative"><input type={showConfirmPassword ? "text" : "password"} required minLength={8} value={form.confirmPassword} onChange={e => change("confirmPassword", e.target.value)} className={`${input} pr-11`} /><button type="button" onClick={() => setShowConfirmPassword(current => !current)} className="absolute inset-y-0 right-0 mt-1.5 flex w-11 items-center justify-center text-zinc-500 hover:text-emerald-700" aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{form.confirmPassword && form.password !== form.confirmPassword && <span className="text-[10px] font-normal text-rose-600">两次输入的密码不一致</span>}</label>
        <button disabled={submitting} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60">{submitting ? "处理中…" : "注册账户"}</button>
      </form> : <form onSubmit={handleLogin} className="space-y-4"><label className="block text-xs font-bold text-zinc-500"><span className="flex gap-1"><UserRound className="h-3.5 w-3.5" />电子邮箱</span><input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={input} /></label><label className="block text-xs font-bold text-zinc-500"><span className="flex gap-1"><KeyRound className="h-3.5 w-3.5" />密码</span><input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={input} /></label><button disabled={submitting} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60">{submitting ? "登录中…" : "确认登录"}</button></form>}
      {message && <p role="status" className={`mt-3 rounded-lg p-2.5 text-xs ${messageKind === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{message}</p>}
      <div className="mt-5 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500">{register ? <>已有账户？ <button onClick={() => { setRegister(false); setMessage(""); }} className="font-bold text-emerald-700 underline">立即登录</button></> : <>还没有账户？ <button onClick={() => { setRegister(true); setMessage(""); }} className="font-bold text-emerald-700 underline">免费注册</button></>}</div>
    </div>
  </div>;
}
