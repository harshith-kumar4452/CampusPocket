import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

serve(async (req) => {
  try {
    const body = await req.json()
    const message = body.message
    const callbackQuery = body.callback_query

    // Handle inline button presses
    if (callbackQuery) {
      const chatId = callbackQuery.message.chat.id
      const data = callbackQuery.data

      // Acknowledge the button press
      await answerCallbackQuery(callbackQuery.id)

      // Route to the right handler
      if (data === "attendance") await handleAttendance(chatId)
      else if (data === "fees") await handleFees(chatId)
      else if (data === "performance") await handlePerformance(chatId)
      else if (data === "report_card") await handleReportCard(chatId)
      else if (data === "timetable") await handleTimetable(chatId)
      else if (data === "exams") await handleExams(chatId)
      else if (data === "menu") await sendMainMenu(chatId)
      else if (data === "help") await sendHelp(chatId)

      return new Response("OK")
    }

    // Handle text messages
    if (!message) return new Response("OK")

    const chatId = message.chat.id
    const text = (message.text || "").trim()

    if (text === "/start") {
      await sendWelcome(chatId)
    }
    else if (text.startsWith("/link")) {
      const code = text.split(" ")[1]
      if (!code) {
        await sendTelegramMessage(chatId, "📎 Please provide a verification code.\n\nExample: `/link 123456`\n\nYou can get this code from the *Campus Pocket* app → Parent Dashboard → Telegram Notifications.")
      } else {
        await handleLinking(chatId, code)
      }
    }
    else if (text === "/menu") await sendMainMenu(chatId)
    else if (text === "/attendance") await handleAttendance(chatId)
    else if (text === "/fees") await handleFees(chatId)
    else if (text === "/performance") await handlePerformance(chatId)
    else if (text === "/reportcard") await handleReportCard(chatId)
    else if (text === "/timetable") await handleTimetable(chatId)
    else if (text === "/exams") await handleExams(chatId)
    else if (text === "/help") await sendHelp(chatId)
    else {
      await sendTelegramMessage(chatId, "🤔 I didn't understand that.\n\nType /menu to see all options or /help for a list of commands.")
    }

    return new Response("OK")
  } catch (e) {
    console.error(e)
    return new Response("Error", { status: 500 })
  }
})

// ─── Telegram API Helpers ────────────────────────────────────

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  }
  if (replyMarkup) {
    payload.reply_markup = JSON.stringify(replyMarkup)
  }
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

async function answerCallbackQuery(callbackQueryId: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  })
}

// ─── Welcome & Menu ──────────────────────────────────────────

async function sendWelcome(chatId: number) {
  // Check if already linked
  const { data: user } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("telegram_chat_id", chatId)
    .single()

  if (user) {
    await sendTelegramMessage(
      chatId,
      `Welcome back, *${user.full_name}*! 🎉\n\nYour account is already linked. Use the menu below to check your children's details.`,
      getMainMenuKeyboard()
    )
  } else {
    await sendTelegramMessage(
      chatId,
      "🎓 *Welcome to Campus Pocket Parent Bot!*\n\n" +
      "I can help you track your child's:\n" +
      "📋 Attendance\n" +
      "💰 Fees\n" +
      "📊 Performance\n" +
      "📝 Report Cards\n" +
      "📅 Timetable\n" +
      "🗓 Exam Schedule\n\n" +
      "To get started, link your account:\n" +
      "1️⃣ Open *Campus Pocket* app\n" +
      "2️⃣ Go to Parent Dashboard\n" +
      "3️⃣ Tap *Enable Telegram Bot*\n" +
      "4️⃣ Type `/link <code>` here\n\n" +
      "Example: `/link 123456`"
    )
  }
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📋 Attendance", callback_data: "attendance" },
        { text: "💰 Fees", callback_data: "fees" },
      ],
      [
        { text: "📊 Performance", callback_data: "performance" },
        { text: "📝 Report Card", callback_data: "report_card" },
      ],
      [
        { text: "📅 Timetable", callback_data: "timetable" },
        { text: "🗓 Exams", callback_data: "exams" },
      ],
      [
        { text: "❓ Help", callback_data: "help" },
      ],
    ],
  }
}

async function sendMainMenu(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  await sendTelegramMessage(
    chatId,
    `📱 *Main Menu*\n\nHello *${user.full_name}*! What would you like to check?`,
    getMainMenuKeyboard()
  )
}

async function sendHelp(chatId: number) {
  await sendTelegramMessage(
    chatId,
    "📖 *Available Commands*\n\n" +
    "/menu — Show interactive menu\n" +
    "/attendance — Today's attendance\n" +
    "/fees — Pending fee details\n" +
    "/performance — Recent quiz scores\n" +
    "/reportcard — Latest report card\n" +
    "/timetable — Today's timetable\n" +
    "/exams — Upcoming exams\n" +
    "/help — Show this help\n\n" +
    "💡 *Tip:* You can also use the buttons in /menu for quick access!",
    { inline_keyboard: [[{ text: "📱 Open Menu", callback_data: "menu" }]] }
  )
}

// ─── User Lookup Helper ──────────────────────────────────────

async function getLinkedUser(chatId: number) {
  const { data: user } = await supabase
    .from("profiles")
    .select("id, full_name, class_level")
    .eq("telegram_chat_id", chatId)
    .single()

  if (!user) {
    await sendTelegramMessage(
      chatId,
      "⚠️ Your account is not linked yet.\n\nPlease use the Campus Pocket app to generate a code, then type:\n`/link <code>`"
    )
    return null
  }
  return user
}

async function getChildren(parentId: string) {
  const { data: links } = await supabase
    .from("student_parents")
    .select("student_id")
    .eq("parent_id", parentId)

  if (!links || links.length === 0) return []

  const studentIds = links.map((l: any) => l.student_id)
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, class_level")
    .in("id", studentIds)

  return students || []
}

// ─── Linking ─────────────────────────────────────────────────

async function handleLinking(chatId: number, code: string) {
  const { data, error } = await supabase
    .from("telegram_verification_codes")
    .select("user_id")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !data) {
    await sendTelegramMessage(chatId, "❌ Invalid or expired code.\n\nPlease generate a new one from the Campus Pocket app and try again.")
    return
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ telegram_chat_id: chatId })
    .eq("id", data.user_id)

  if (updateError) {
    await sendTelegramMessage(chatId, "❌ Error linking account. Please try again later.")
    return
  }

  // Cleanup used code
  await supabase.from("telegram_verification_codes").delete().eq("user_id", data.user_id)

  // Get the user's name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.user_id)
    .single()

  await sendTelegramMessage(
    chatId,
    `✅ *Account Linked Successfully!*\n\nWelcome, *${profile?.full_name}*! 🎉\n\nYou will now receive school updates here. Use the menu below to explore:`,
    getMainMenuKeyboard()
  )
}

// ─── Attendance ──────────────────────────────────────────────

async function handleAttendance(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "📋 No students linked to your account.", backToMenuKeyboard())
    return
  }

  const today = new Date().toISOString().split("T")[0]
  let report = "📋 *Attendance Report*\n📅 " + formatDate(today) + "\n\n"

  for (const child of children) {
    report += `👤 *${child.full_name}* (Class ${child.class_level || "N/A"})\n`

    const { data: attendance } = await supabase
      .from("attendance")
      .select("subject_name, status")
      .eq("student_id", child.id)
      .eq("date", today)

    if (!attendance || attendance.length === 0) {
      report += "  ⏳ Not marked yet today\n"
    } else {
      const present = attendance.filter((a: any) => a.status === "present").length
      const absent = attendance.filter((a: any) => a.status === "absent").length
      const late = attendance.filter((a: any) => a.status === "late").length
      
      report += `  ✅ Present: ${present} | ❌ Absent: ${absent} | ⏰ Late: ${late}\n`
      
      for (const record of attendance) {
        const emoji = record.status === "present" ? "✅" : record.status === "absent" ? "❌" : "⏰"
        report += `  ${emoji} ${record.subject_name || "General"}\n`
      }
    }

    // Weekly stats
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
    const { data: weekAttendance } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", child.id)
      .gte("date", weekAgo)
      .lte("date", today)

    if (weekAttendance && weekAttendance.length > 0) {
      const total = weekAttendance.length
      const presentCount = weekAttendance.filter((a: any) => a.status === "present").length
      const pct = Math.round((presentCount / total) * 100)
      report += `  📊 Weekly: ${pct}% (${presentCount}/${total})\n`
    }

    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Fees ────────────────────────────────────────────────────

async function handleFees(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "💰 No students linked to your account.", backToMenuKeyboard())
    return
  }

  let report = "💰 *Fee Details*\n\n"

  for (const child of children) {
    report += `👤 *${child.full_name}*\n`

    const { data: fees } = await supabase
      .from("fees")
      .select("title, amount, status, due_date, paid_at")
      .eq("student_id", child.id)
      .order("due_date", { ascending: false })
      .limit(10)

    if (!fees || fees.length === 0) {
      report += "  ℹ️ No fee records found\n"
    } else {
      let totalPending = 0
      let totalPaid = 0

      for (const fee of fees) {
        const statusEmoji = fee.status === "paid" ? "✅" : fee.status === "overdue" ? "🔴" : "🟡"
        report += `  ${statusEmoji} *${fee.title}*: ₹${fee.amount}\n`
        report += `     Due: ${formatDate(fee.due_date)}`
        if (fee.status === "paid" && fee.paid_at) {
          report += ` | Paid: ${formatDate(fee.paid_at.split("T")[0])}`
          totalPaid += Number(fee.amount)
        } else {
          totalPending += Number(fee.amount)
        }
        report += "\n"
      }

      report += `\n  💵 *Total Pending: ₹${totalPending}*\n`
      report += `  ✅ Total Paid: ₹${totalPaid}\n`
    }
    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Performance (Quiz Results) ──────────────────────────────

async function handlePerformance(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "📊 No students linked to your account.", backToMenuKeyboard())
    return
  }

  let report = "📊 *Recent Performance*\n\n"

  for (const child of children) {
    report += `👤 *${child.full_name}*\n`

    const { data: results } = await supabase
      .from("quiz_results")
      .select("score, submitted_at, quiz:quizzes(title, total_marks, class:classes(subject))")
      .eq("student_id", child.id)
      .order("submitted_at", { ascending: false })
      .limit(8)

    if (!results || results.length === 0) {
      report += "  ℹ️ No quiz results yet\n"
    } else {
      let totalScore = 0
      let totalMarks = 0

      for (const r of results) {
        const quiz = r.quiz as any
        const subject = quiz?.class?.subject || "General"
        const pct = quiz?.total_marks ? Math.round((r.score / quiz.total_marks) * 100) : 0
        const emoji = pct >= 80 ? "🟢" : pct >= 50 ? "🟡" : "🔴"
        
        report += `  ${emoji} *${quiz?.title || "Quiz"}* (${subject})\n`
        report += `     Score: ${r.score}/${quiz?.total_marks || "?"} (${pct}%)\n`
        
        totalScore += r.score
        totalMarks += (quiz?.total_marks || 0)
      }

      if (totalMarks > 0) {
        const avgPct = Math.round((totalScore / totalMarks) * 100)
        report += `\n  📈 *Overall Average: ${avgPct}%*\n`
      }
    }
    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Report Card ─────────────────────────────────────────────

async function handleReportCard(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "📝 No students linked to your account.", backToMenuKeyboard())
    return
  }

  let report = "📝 *Report Card*\n\n"

  for (const child of children) {
    report += `👤 *${child.full_name}* (Class ${child.class_level || "N/A"})\n`

    const { data: cards } = await supabase
      .from("report_cards")
      .select("exam_name, exam_type, subject_name, marks_obtained, total_marks, grade, academic_year")
      .eq("student_id", child.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (!cards || cards.length === 0) {
      report += "  ℹ️ No report card data yet\n"
    } else {
      // Group by exam_name
      const grouped: Record<string, any[]> = {}
      for (const card of cards) {
        const key = card.exam_name || "General"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(card)
      }

      for (const [examName, subjects] of Object.entries(grouped)) {
        report += `\n  🏫 *${examName}*\n`
        let totalObtained = 0
        let totalMax = 0

        for (const s of subjects) {
          const pct = s.total_marks ? Math.round((s.marks_obtained / s.total_marks) * 100) : 0
          const emoji = pct >= 80 ? "🟢" : pct >= 50 ? "🟡" : "🔴"
          report += `  ${emoji} ${s.subject_name}: ${s.marks_obtained}/${s.total_marks} (${s.grade || ""})\n`
          totalObtained += s.marks_obtained
          totalMax += s.total_marks
        }

        if (totalMax > 0) {
          const overallPct = Math.round((totalObtained / totalMax) * 100)
          report += `  📊 *Total: ${totalObtained}/${totalMax} (${overallPct}%)*\n`
        }
      }
    }
    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Timetable ───────────────────────────────────────────────

async function handleTimetable(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "📅 No students linked to your account.", backToMenuKeyboard())
    return
  }

  const dayOfWeek = new Date().getDay() // 0=Sun, 1=Mon, ...
  const dayName = DAYS[dayOfWeek]

  let report = `📅 *Today's Timetable*\n🗓 ${dayName}\n\n`

  if (dayOfWeek === 0) {
    report += "🎉 It's Sunday! No classes today. Enjoy your day!\n"
    await sendTelegramMessage(chatId, report, backToMenuKeyboard())
    return
  }

  for (const child of children) {
    report += `👤 *${child.full_name}* (Class ${child.class_level || "N/A"})\n`

    if (!child.class_level) {
      report += "  ⚠️ Class level not set\n\n"
      continue
    }

    const { data: periods } = await supabase
      .from("timetable_periods")
      .select("period_number, subject_name, start_time, end_time, teacher_name, room")
      .eq("class_level", child.class_level)
      .eq("day_of_week", dayOfWeek)
      .order("period_number", { ascending: true })

    if (!periods || periods.length === 0) {
      report += "  ℹ️ No classes scheduled today\n"
    } else {
      for (const p of periods) {
        report += `  📚 *Period ${p.period_number}* — ${p.subject_name}\n`
        report += `     ⏰ ${p.start_time} - ${p.end_time}`
        if (p.teacher_name) report += ` | 👨‍🏫 ${p.teacher_name}`
        if (p.room) report += ` | 🏫 ${p.room}`
        report += "\n"
      }
    }
    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Exams ───────────────────────────────────────────────────

async function handleExams(chatId: number) {
  const user = await getLinkedUser(chatId)
  if (!user) return

  const children = await getChildren(user.id)
  if (children.length === 0) {
    await sendTelegramMessage(chatId, "🗓 No students linked to your account.", backToMenuKeyboard())
    return
  }

  const today = new Date().toISOString().split("T")[0]
  let report = "🗓 *Upcoming Exams*\n\n"

  for (const child of children) {
    report += `👤 *${child.full_name}* (Class ${child.class_level || "N/A"})\n`

    if (!child.class_level) {
      report += "  ⚠️ Class level not set\n\n"
      continue
    }

    const { data: exams } = await supabase
      .from("exam_schedules")
      .select("exam_name, exam_type, subject_name, exam_date, start_time, end_time, total_marks")
      .eq("class_level", child.class_level)
      .gte("exam_date", today)
      .order("exam_date", { ascending: true })
      .limit(10)

    if (!exams || exams.length === 0) {
      report += "  ✨ No upcoming exams! Time to relax.\n"
    } else {
      for (const exam of exams) {
        const daysLeft = Math.ceil((new Date(exam.exam_date).getTime() - Date.now()) / 86400000)
        const urgency = daysLeft <= 3 ? "🔴" : daysLeft <= 7 ? "🟡" : "🟢"
        
        report += `  ${urgency} *${exam.subject_name}* — ${exam.exam_name}\n`
        report += `     📅 ${formatDate(exam.exam_date)} (${daysLeft} days left)\n`
        report += `     ⏰ ${exam.start_time} - ${exam.end_time} | Marks: ${exam.total_marks}\n`
      }
    }
    report += "\n"
  }

  await sendTelegramMessage(chatId, report, backToMenuKeyboard())
}

// ─── Utilities ───────────────────────────────────────────────

function backToMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📱 Back to Menu", callback_data: "menu" }],
    ],
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}
