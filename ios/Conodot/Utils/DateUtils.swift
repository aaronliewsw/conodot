import Foundation

enum DateUtils {
    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let displayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter
    }()

    static func todayString() -> String {
        dateFormatter.string(from: Date())
    }

    static func dateString(from date: Date) -> String {
        dateFormatter.string(from: date)
    }

    static func date(from string: String) -> Date? {
        dateFormatter.date(from: string)
    }

    static func formatForDisplay(_ dateString: String) -> String {
        guard let date = date(from: dateString) else { return dateString }
        return displayFormatter.string(from: date)
    }

    static func isYesterday(_ dateString: String) -> Bool {
        guard let date = date(from: dateString) else { return false }
        return Calendar.current.isDateInYesterday(date)
    }

    static func isToday(_ dateString: String) -> Bool {
        return dateString == todayString()
    }

    static func hoursSince(_ date: Date) -> Double {
        Date().timeIntervalSince(date) / 3600
    }

    /// Get group info for archive display
    /// Groups: Yesterday, Previous Month (by name), Previous Year (excluding previous month)
    static func getGroupInfo(for dateString: String) -> (key: String, label: String, sortOrder: Int) {
        guard let date = date(from: dateString) else {
            return (key: dateString, label: dateString, sortOrder: 9999)
        }

        let now = Date()
        let calendar = Calendar.current

        // Check if yesterday
        if calendar.isDateInYesterday(date) {
            return (key: "yesterday", label: "Yesterday", sortOrder: 0)
        }

        let taskYear = calendar.component(.year, from: date)
        let taskMonth = calendar.component(.month, from: date)
        let currentYear = calendar.component(.year, from: now)
        let currentMonth = calendar.component(.month, from: now)

        // Calculate previous month
        let previousMonth: Int
        let previousMonthYear: Int
        if currentMonth == 1 {
            previousMonth = 12
            previousMonthYear = currentYear - 1
        } else {
            previousMonth = currentMonth - 1
            previousMonthYear = currentYear
        }

        // Check if in previous month
        if taskYear == previousMonthYear && taskMonth == previousMonth {
            let monthName = date.formatted(.dateTime.month(.wide))
            return (key: "prev-month", label: monthName, sortOrder: 1)
        }

        // Check if in current month (but not yesterday) - group as "Earlier This Month"
        if taskYear == currentYear && taskMonth == currentMonth {
            return (key: "this-month", label: "Earlier This Month", sortOrder: 2)
        }

        // Check if earlier in current year (but not previous month)
        if taskYear == currentYear {
            let monthName = date.formatted(.dateTime.month(.wide))
            return (key: "month-\(taskMonth)", label: monthName, sortOrder: 100 - taskMonth)
        }

        // Previous years - group by year
        return (key: "year-\(taskYear)", label: String(taskYear), sortOrder: 1000 - taskYear)
    }
}
