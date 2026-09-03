import { useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldAlert, UserRound, X } from "lucide-react";
import { supabase, supabaseIsConfigured } from "../lib/supabase";

type Registration = { familyName: string; givenName: string; gender: "" | "male" | "female"; email: string; phone: string; password: string; confirmPassword: string };
const empty: Registration = { familyName: "", givenName: "", gender: "", email: "", phone: "", password: "", confirmPassword: "" };
const input = "mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm outline-none focus:border-emerald-600";
const passwordValid = (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
const userServiceAgreement = `# 《用户服务协议》

更新/生效日期：2026年8月1日

欢迎您使用本平台（以下简称“我们”或“平台”）。本协议是您（以下简称“用户”或“您”）与平台之间就注册、登录、使用本网站服务所订立的具有法律约束力的协议。

在注册成为用户或使用我们的服务前，请您务必仔细阅读并充分理解本协议的全部内容，特别是有关免责声明、户外风险自担、陪爬服务性质及隐私保护的相关条款。当您勾选“同意《用户服务协议》”或实际使用本网站服务时，即表示您已阅读、理解并同意接受本协议的所有约定。

一、服务内容与平台定位

1. 服务概述：我们专注于为欧洲华人及户外爱好者提供轻量化的一日徒步解决方案，包括但不限于：
- 一日徒步计划推荐：根据您输入的所在城市与出发时间，为您生成或推荐周边的一日徒步路线、交通指引及准备建议。
- 陪爬与搭子结伴服务：为有结伴需求的华人提供徒步同伴（陪爬员）的信息对接与结伴平台，帮助用户开启有伴、安全的户外体验。
- 路线指引与无车出行建议：提供线路难度分级、公共交通到达方式及华人实测路况等辅助信息。

2. 平台法律定位：
- 本平台为信息服务与搭子结伴平台，并非专业旅行社、高风险户外救援组织或劳务派遣机构。
- 平台展示的所有路线信息、交通及天气提示仅供参考，不构成对路线绝对安全性或通畅性的担保。

二、账号注册与使用规范

1. 注册要求：您在注册时须提供真实、准确的个人信息（如昵称、联系方式等）。如因信息不实引发沟通障碍或安全事故，相关后果由用户自行承担。
2. 账号安全：您应妥善保管自己的账号及密码，不得将账号转让、租借或售予他人。
3. 禁止行为：用户不得利用本平台发布色情、暴力、诈骗、虚假宣传、侵权或违背当地法律法规的内容，亦不得利用陪爬或结伴名义从事任何违法或不道德活动。

三、户外风险自担与安全条款（核心）

1. 风险知情与自担：
- 户外徒步存在不可预测的自然风险（包括但不限于天气突变、滑倒摔伤、昆虫/野生动物叮咬、体力透支、迷路等）。
- 用户参与任何徒步活动前，须确认自身健康状况良好（无心脏病、高血压、严重哮喘、癫痫或严重关节损伤等不适宜剧烈运动的疾病），并自行评估和承担行程中的风险。

2. 强制保险要求：
- 所有参与一日徒步或陪爬预约的用户，须在出发前自行购买覆盖活动当日及所在国家/地区的户外人身意外伤害保险。
- 如在活动期间发生任何人身伤害或财产损失，相关救援与赔偿由用户本人及保险公司依法承担，平台及同行的陪爬伙伴不承担法律赔偿责任。

3. 陪爬/结伴服务免责：
- 陪爬员（搭子）提供的是“同伴式陪伴、路线指引与互相照顾”服务。陪爬员并非专业救援人员或私人保姆。
- 参与者须自备合格的户外装备（如抓地力良好的徒步鞋、防风衣物、饮用水等）。因用户装备不合格、擅自脱队、违反安全提示或不可抗力引发的事故，由用户自行承担。

四、预约、费用与退改规则

1. 服务费用：
- 平台展示的陪爬服务费用仅包含约定范围内的陪伴与路线指引，通常不包含用户的交通费、门票费、餐饮费及个人保险费（除双方另有明确约定外）。

2. 取消与退款：
- 因恶劣天气、自然灾害等不可抗力因素导致无法出行的，双方可协商更改行程或按照约定办理退款。
- 用户若需取消预约，需遵循平台公布的取消时限规则，超时取消可能产生一定的取消费用。

五、知识产权与用户内容

1. 平台内容：网站内的文字、设计、图片、路线整理及程序代码等，版权归本平台或原权利人所有。
2. 用户发布：用户在平台上传的评价、打卡照片等内容，须保证拥有合法版权。用户授权平台在宣传、展示等非独占性场合免费无偿使用该内容。

六、隐私保护

平台高度重视欧洲华人及广大用户的个人信息保护。我们承诺严格按照相关法律（包括欧盟 GDPR 规范）收集和使用您的必要数据，仅用于为您提供路线匹配、沟通联系及安全保障之目的。详细规则请参阅本平台《隐私政策》。

七、协议变更与法律管辖

1. 协议修改：平台有权根据业务发展或法律法规要求修改本协议，并通过网站公告或页面提示予以告知。若您继续使用平台服务，即视为同意修改后的协议。
2. 法律适用：本协议的订立、执行、解释及争议解决均适用平台运营主体注册地所在国之法律。如发生纠纷，双方应友好协商；协商不成的，可向平台所在地有管辖权的人民法院/法庭提起诉讼。`;


const privacyPolicy = `# 《隐私政策》

生效/更新日期：2026年9月3日

本平台（以下简称“我们”或“平台”）高度重视欧洲华人及所有用户的个人隐私和数据安全。本《隐私政策》（以下简称“本政策”）旨在说明我们如何收集、使用、存储及保护您的个人信息。

在您使用本网站的一日徒步规划、陪爬预约或社群服务前，请您务必仔细阅读本政策。当您勾选“同意《隐私政策》”或继续使用本平台服务时，即表示您已阅读并同意本政策的全部内容。

一、我们如何收集和使用您的个人信息

为了向您提供优质的一日徒步定制及陪爬结伴服务，我们仅在合法、正当、必要的前提下收集以下信息：

1. 账号注册与基本服务
- 收集的信息：用户昵称、联系方式（如微信号、Telegram、手机号或电子邮箱）、常驻城市/大区。
- 使用目的：用于创建账号、登录身份验证以及在您发起路线咨询或预约陪爬服务时与您取得联系。

2. 一日徒步计划推荐
- 收集的信息：您输入的出发城市、拟出发时间以及徒步偏好（如路线难度、是否偏好无车公共交通路线、是否携带宠物等）。
- 使用目的：用于算法或向导为您智能生成/匹配最合适的一日徒步路书及出行指引。

3. 陪爬与搭子结伴服务（核心安全数据）
- 收集的信息：紧急联系人姓名及电话、同行人基本健康状况确认勾选项、必要的身体与体力自我评估信息。
- 使用目的：仅用于评估户外路线匹配度及在发生突发紧急情况时联系相关人员，我们绝不会公开您的紧急联系人信息或敏感健康承诺。

4. 打卡、评价与用户内容
- 收集的信息：您主动上传的路线打卡照片、评价内容及意见反馈。
- 使用目的：用于在平台展示真实的华人实测路线反馈，帮助更多户外爱好者避坑。

二、我们如何存储与保护您的数据

1. 安全存储：我们采用符合行业标准的安全防护措施（如 SSL 加密传输、数据库权限控制等）来存储和保护您的个人数据，防止数据遭未经授权的访问、泄露、篡改或损坏。
2. 保存期限：我们仅在实现本政策所述目的所需的最短时间内保留您的个人信息。当您注销账号或要求删除数据时，我们将依法抹除或匿名化处理您的数据。

三、我们如何共享或披露您的信息

我们承诺对您的个人信息严格保密。除以下情形外，我们不会向任何第三方共享、出售或出租您的个人信息：

1. 陪爬服务必要共享：在您预约陪爬服务后，为了行程顺利开展，我们会在必要范围内向为您提供指引的陪爬员（搭子）共享您的昵称及约定的集合联系方式。
2. 法律要求或紧急救援：在发生严重户外意外救援、法律诉讼或响应当地执法机关、医疗救援机构合法要求时，我们可能依法披露必要的紧急联系信息或个人安全信息。

四、您的权利（符合 GDPR 规范）

作为欧洲华人和用户，您对自己的个人信息享有以下权利：

1. 访问与更正：您可以随时登录账号查看或更新您的昵称、联系方式等基本资料。
2. 删除与注销（被遗忘权）：若您不再使用本平台服务，可联系我们申请注销账号并抹除您的个人数据。
3. 撤回同意：您可以随时通过取消勾选或联系客服撤回对我们收集特定信息的同意。

五、未成年人保护

本平台的一日徒步与陪爬服务主要面向具备完全民事行为能力的成年户外爱好者。未满 18 周岁的未成年人须在监护人的陪同或明确同意下方可使用本平台或参与徒步行程。

六、隐私政策的更新与联系方式

1. 政策更新：随着平台业务或法律法规的变化，我们可能会适时更新本政策，并在网站显眼位置发布公告。
2. 联系我们：如果您对本《隐私政策》有任何疑问、意见或希望行使您的个人数据权利，请通过以下方式联系我们：
- 联系微信号 / 客服：Ambition_1704
- 联系邮箱：zhaoyilong17@gmail.com`;


const outdoorSafetyDisclaimer = `# 《户外安全与免责声明》

更新/生效日期：2026年9月3日

在您使用本平台提供的徒步路线指引、预约陪爬（搭子结伴）或参与任何相关户外活动前，请务必认真阅读并充分理解本声明。当您勾选“我已阅读并同意《户外安全与免责声明》”、提交预约表单或实际参与活动时，即视为您已完全理解、接受并同意本声明的所有条款。

一、活动性质与平台定位声明

1. 搭子结伴与同行性质：本平台及陪爬伙伴（搭子）提供的是线路指引、同伴式陪伴与互相照顾服务，本平台并非专业旅行社、高风险专业救援队或劳务派遣机构。
2. 路线信息仅供参考：平台及陪爬员提供的路线规划、公共交通到达方式及难度级别，均基于华人实测与经验整理。户外实际路况可能因季节、极端天气、封山或当地政策变化而有所不同，用户须具备基本判断力。

二、户外风险知情与自我评估（核心）

1. 已知与不可预知风险：户外徒步属于带有一定风险的体育活动。参与者已知并承认活动中可能存在不可预知的自然与人身风险（包括但不限于天气突变、滑倒摔伤、落石、野生动物/昆虫叮咬、失温、中暑、体力透支或迷路等）。
2. 健康状况自我承诺：参与者确认自身身体状况良好，无心脏病、高血压、严重哮喘、癫痫、严重关节损伤或近期大手术等不适宜剧烈运动的疾病。如因隐瞒健康状况而导致行程中发生意外，所有法律与经济责任由参与者本人承担。

三、装备要求与强制保险条款

1. 合格装备准备：参与者承诺自备符合欧洲户外标准的装备，包括但不限于抓地力良好的专业徒步鞋/越野跑鞋、防风保暖衣物、雨具以及足够的饮用水和能量补给。因穿着板鞋、高跟鞋或装备不合规引发的滑倒或受伤，由参与者自行承担。
2. 强制购买户外意外险：
- 所有参与徒步或陪爬预约的用户，须在行程出发前自行购买覆盖活动当日及所在国家/地区的个人户外人身意外保险（如阿尔卑斯俱乐部 DAV/CAI 保险或第三方 Allianz 户外险等）。
- 行程中若不幸发生意外人身伤害或财产损失，相关救援、医疗及赔偿由参与者本人及其投保的保险公司依法承担，平台及同行的陪爬伙伴不承担任何法律与经济赔偿责任。

四、团队安全守则与行为规范

1. 遵守规则与环保：参与者须遵守欧洲当地法律法规及环保原则（不乱扔垃圾、不破坏自然生态），并尊重当地户外礼仪。
2. 严禁擅自脱队：行程中参与者须听从合理路线指引，不得擅自偏离既定路线、进入未开发高危区域或进行高风险拍照/攀爬动作。因擅自行动或违规操作引发的一切后果由行为人完全自负。

五、不可抗力与行程变更

因极端天气（如暴雪、暴雨、大雾）、自然灾害、公共交通中断或封山等不可抗力因素，平台及陪爬员有权根据安全第一的原则随时终止、修改或中途腰斩行程。因不可抗力导致的行程取消或调整，平台及陪爬员不承担任何额外的间接经济赔偿责任。`;

export default function AuthDialog({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (username: string) => void }) {
  const [register, setRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [form, setForm] = useState<Registration>(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showSafetyDisclaimer, setShowSafetyDisclaimer] = useState(false);
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
    if (!acceptedPolicies) { setMessageKind("error"); return setMessage("请先阅读并同意用户服务协议、隐私政策及户外安全与免责声明。"); }
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
        <label className="flex items-start gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-5 text-zinc-600">
          <input type="checkbox" required checked={acceptedPolicies} onChange={e => setAcceptedPolicies(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600" />
          <span>我已阅读并同意 <button type="button" onClick={() => setShowUserAgreement(true)} className="font-bold text-emerald-700 underline underline-offset-2">《用户服务协议》</button>、<button type="button" onClick={() => setShowPrivacyPolicy(true)} className="font-bold text-emerald-700 underline underline-offset-2">《隐私政策》</button> 及 <button type="button" onClick={() => setShowSafetyDisclaimer(true)} className="font-bold text-emerald-700 underline underline-offset-2">《户外安全与免责声明》</button></span>
        </label>
        <button disabled={submitting} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60">{submitting ? "处理中…" : "注册账户"}</button>
      </form> : <form onSubmit={handleLogin} className="space-y-4"><label className="block text-xs font-bold text-zinc-500"><span className="flex gap-1"><UserRound className="h-3.5 w-3.5" />电子邮箱</span><input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={input} /></label><label className="block text-xs font-bold text-zinc-500"><span className="flex gap-1"><KeyRound className="h-3.5 w-3.5" />密码</span><input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={input} /></label><button disabled={submitting} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60">{submitting ? "登录中…" : "确认登录"}</button></form>}
      {message && <p role="status" className={`mt-3 rounded-lg p-2.5 text-xs ${messageKind === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{message}</p>}
      {showUserAgreement && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setShowUserAgreement(false)}>
          <div className="max-h-[82vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h3 className="text-base font-extrabold text-zinc-950">用户服务协议</h3>
              <button type="button" onClick={() => setShowUserAgreement(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" aria-label="关闭用户服务协议"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[64vh] overflow-y-auto px-5 py-4 text-sm leading-7 text-zinc-700 whitespace-pre-wrap">{userServiceAgreement}</div>
            <div className="border-t border-zinc-100 px-5 py-4">
              <button type="button" onClick={() => setShowUserAgreement(false)} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">我已阅读</button>
            </div>
          </div>
        </div>
      )}      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setShowPrivacyPolicy(false)}>
          <div className="max-h-[82vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h3 className="text-base font-extrabold text-zinc-950">隐私政策</h3>
              <button type="button" onClick={() => setShowPrivacyPolicy(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" aria-label="关闭隐私政策"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[64vh] overflow-y-auto px-5 py-4 text-sm leading-7 text-zinc-700 whitespace-pre-wrap">{privacyPolicy}</div>
            <div className="border-t border-zinc-100 px-5 py-4">
              <button type="button" onClick={() => setShowPrivacyPolicy(false)} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">我已阅读</button>
            </div>
          </div>
        </div>
      )}      {showSafetyDisclaimer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setShowSafetyDisclaimer(false)}>
          <div className="max-h-[82vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h3 className="text-base font-extrabold text-zinc-950">户外安全与免责声明</h3>
              <button type="button" onClick={() => setShowSafetyDisclaimer(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" aria-label="关闭户外安全与免责声明"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[64vh] overflow-y-auto px-5 py-4 text-sm leading-7 text-zinc-700 whitespace-pre-wrap">{outdoorSafetyDisclaimer}</div>
            <div className="border-t border-zinc-100 px-5 py-4">
              <button type="button" onClick={() => setShowSafetyDisclaimer(false)} className="w-full rounded-lg bg-emerald-800 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">我已阅读</button>
            </div>
          </div>
        </div>
      )}      <div className="mt-5 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500">{register ? <>已有账户？ <button onClick={() => { setRegister(false); setMessage(""); }} className="font-bold text-emerald-700 underline">立即登录</button></> : <>还没有账户？ <button onClick={() => { setRegister(true); setMessage(""); }} className="font-bold text-emerald-700 underline">免费注册</button></>}</div>
    </div>
  </div>;
}


