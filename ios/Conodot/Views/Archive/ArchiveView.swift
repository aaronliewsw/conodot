import SwiftUI

struct ArchiveView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var selectedTask: Task?

    private var groupedTasks: [(key: String, label: String, tasks: [Task])] {
        var groups: [String: (label: String, sortOrder: Int, tasks: [Task])] = [:]

        for task in appState.archive {
            let dateStr = task.completedAt != nil
                ? DateUtils.dateString(from: task.completedAt!)
                : DateUtils.dateString(from: task.createdAt)

            let info = DateUtils.getGroupInfo(for: dateStr)

            if groups[info.key] == nil {
                groups[info.key] = (label: info.label, sortOrder: info.sortOrder, tasks: [])
            }
            groups[info.key]?.tasks.append(task)
        }

        // Sort tasks within each group (newest first)
        for key in groups.keys {
            groups[key]?.tasks.sort { task1, task2 in
                let date1 = task1.completedAt ?? task1.createdAt
                let date2 = task2.completedAt ?? task2.createdAt
                return date1 > date2
            }
        }

        // Return sorted groups
        return groups
            .sorted { $0.value.sortOrder < $1.value.sortOrder }
            .map { (key: $0.key, label: $0.value.label, tasks: $0.value.tasks) }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.dustGrey.ignoresSafeArea()

                if appState.archive.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 24) {
                            ForEach(groupedTasks, id: \.key) { group in
                                VStack(alignment: .leading, spacing: 8) {
                                    // Group header
                                    Text(group.label)
                                        .font(.subheadline.weight(.medium))
                                        .foregroundColor(Theme.taupe)
                                        .padding(.horizontal)

                                    // Tasks in group
                                    VStack(spacing: 0) {
                                        ForEach(group.tasks) { task in
                                            archiveRow(task)
                                            Divider()
                                                .background(Theme.silver.opacity(0.2))
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle("Archive")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(Theme.chestnut)
                }
            }
            .sheet(item: $selectedTask) { task in
                TaskDetailView(task: task, readOnly: true)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "archivebox")
                .font(.system(size: 48))
                .foregroundColor(Theme.silver)

            Text("No archived tasks yet")
                .font(.headline)
                .foregroundColor(Theme.taupe)

            Text("Completed tasks will appear here after midnight")
                .font(.subheadline)
                .foregroundColor(Theme.silver)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private func archiveRow(_ task: Task) -> some View {
        Button(action: { selectedTask = task }) {
            HStack(spacing: 12) {
                Text(task.type.rawValue.uppercased())
                    .font(.caption.weight(.medium))
                    .foregroundColor(task.type == .signal ? Theme.chestnut : Theme.taupe)

                Text(task.title)
                    .font(.body)
                    .foregroundColor(Theme.taupe)
                    .strikethrough()
                    .lineLimit(1)

                Spacer()
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
            .background(Theme.silver.opacity(0.05))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ArchiveView()
        .environmentObject(AppState())
}
