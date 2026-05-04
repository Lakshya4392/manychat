"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export const getDashboardStats = async () => {
  const { userId } = await auth()
  if (!userId) return null

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!dbUser) return null

    const dms = await db.dms.count({
      where: {
        Automation: {
          userId: dbUser.id,
        },
        messageType: "DM",
      },
    })

    const comments = await db.dms.count({
      where: {
        Automation: {
          userId: dbUser.id,
        },
        messageType: "COMMENT",
      },
    })

    const totalInteractions = await db.dms.count({
      where: {
        Automation: {
          userId: dbUser.id,
        },
        isFromBot: false,
      },
    })

    const botResponses = await db.dms.count({
      where: {
        Automation: {
          userId: dbUser.id,
        },
        isFromBot: true,
      },
    })

    const responseRate = totalInteractions > 0 
      ? Math.round((botResponses / totalInteractions) * 100) 
      : 0

    return {
      dms,
      comments,
      responseRate,
      totalInteractions,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return null
  }
}

export const getChartData = async () => {
    const { userId } = await auth()
    if (!userId) return []
  
    try {
      const dbUser = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      })
  
      if (!dbUser) return []
  
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
  
      const interactions = await db.dms.findMany({
        where: {
          Automation: {
            userId: dbUser.id,
          },
          createdAt: {
            gte: sevenDaysAgo,
          },
          isFromBot: false,
        },
        select: {
          createdAt: true,
        },
      })
  
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const chartData: Record<string, { day: string, count: number, fullDate: string }> = {}
  
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayName = days[d.getDay()]
        const dateStr = d.toISOString().split('T')[0]
        chartData[dateStr] = {
          day: dayName,
          count: 0,
          fullDate: dateStr
        }
      }
  
      interactions.forEach((interaction) => {
        const dateStr = interaction.createdAt.toISOString().split('T')[0]
        if (chartData[dateStr]) {
          chartData[dateStr].count += 1
        }
      })
  
      return Object.values(chartData).sort((a, b) => a.fullDate.localeCompare(b.fullDate))
    } catch (error) {
      console.error("Error fetching chart data:", error)
      return []
    }
}

export const getContacts = async () => {
    const { userId } = await auth()
    if (!userId) return []
  
    try {
      const dbUser = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      })
  
      if (!dbUser) return []
  
      const recentDms = await db.dms.findMany({
        where: {
          Automation: {
            userId: dbUser.id,
          },
          isFromBot: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
        distinct: ['senderId'],
        take: 50,
      })
  
      return recentDms.map(dm => ({
        id: dm.senderId || dm.id,
        name: dm.senderUsername || "Unknown",
        email: "Instagram Contact",
        avatar: "",
        status: (new Date().getTime() - dm.createdAt.getTime()) < 86400000 ? "Active" : "Recent",
        lastContacted: dm.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        duration: "Recently"
      }))
    } catch (error) {
      console.error("Error fetching contacts:", error)
      return []
    }
}
