import SwiftUI

struct TaskDetailView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    let task: Task
    var readOnly: Bool = false

    @State private var title: String = ""
    @State private var notes: String = ""

    private var taskColor: Color {
        task.type == .signal ? Theme.chestnut : Theme.taupe
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Task type badge
                    Text(task.type.rawValue.uppercased())
                        .font(.caption.weight(.medium))
                        .tracking(0.5)
                        .foregroundColor(taskColor)

                    // Title
                    if readOnly {
                        Text(task.title)
                            .font(.title3)
                            .foregroundColor(task.isCompleted ? Theme.taupe : Theme.chestnut)
                            .strikethrough(task.isCompleted)
                    } else {
                        HStack(alignment: .top, spacing: 12) {
                            // Checkbox
                            Button(action: completeTask) {
                                Circle()
                                    .strokeBorder(
                                        appState.isPlanningMode ? Theme.silver.opacity(0.5) : taskColor,
                                        lineWidth: 2
                                    )
                                    .frame(width: 24, height: 24)
                                    .background(
                                        Circle()
                                            .fill(task.isCompleted ? Theme.chestnut : Color.clear)
                                    )
                                    .overlay {
                                        if task.isCompleted {
                                            Image(systemName: "checkmark")
                                                .font(.system(size: 10, weight: .bold))
                                                .foregroundColor(Theme.dustGrey)
                                        }
                                    }
                            }
                            .buttonStyle(.plain)
                            .disabled(task.isCompleted || appState.isPlanningMode)

                            TextEditor(text: $title)
                                .font(.title3)
                                .foregroundColor(task.isCompleted ? Theme.taupe : Theme.chestnut)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 60, maxHeight: 200)
                                .fixedSize(horizontal: false, vertical: true)
                                .disabled(task.isCompleted)
                        }
                    }

                    // Notes section
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes")
                            .font(.caption.weight(.medium))
                            .foregroundColor(Theme.taupe)

                        if readOnly {
                            Text(task.notes?.isEmpty == false ? task.notes! : "No notes")
                                .font(.body)
                                .foregroundColor(task.notes?.isEmpty == false ? Theme.taupe : Theme.silver)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Theme.silver.opacity(0.1))
                                .cornerRadius(8)
                        } else {
                            TextEditor(text: $notes)
                                .font(.body)
                                .foregroundColor(Theme.taupe)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 100)
                                .padding(8)
                                .background(Theme.silver.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }

                    // Date info
                    VStack(alignment: .leading, spacing: 4) {
                        Divider()
                            .background(Theme.silver.opacity(0.2))
                            .padding(.vertical, 8)

                        if task.isCompleted, let completedAt = task.completedAt {
                            Text("Completed: \(DateUtils.formatForDisplay(DateUtils.dateString(from: completedAt)))")
                                .font(.caption)
                                .foregroundColor(Theme.silver)
                        } else {
                            Text("Created: \(DateUtils.formatForDisplay(DateUtils.dateString(from: task.createdAt)))")
                                .font(.caption)
                                .foregroundColor(Theme.silver)
                        }
                    }

                    Spacer()
                }
                .padding()
            }
            .background(Theme.dustGrey)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        saveChanges()
                        dismiss()
                    }
                    .foregroundColor(Theme.chestnut)
                }
            }
        }
        .onAppear {
            title = task.title
            notes = task.notes ?? ""
        }
        .onDisappear {
            if !readOnly {
                saveChanges()
            }
        }
    }

    private func completeTask() {
        guard !task.isCompleted && !appState.isPlanningMode else { return }
        HapticFeedback.success()
        appState.completeTask(task.id)
        dismiss()
    }

    private func saveChanges() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedTitle.isEmpty && trimmedTitle != task.title {
            appState.updateTaskTitle(task.id, title: trimmedTitle)
        }

        let trimmedNotes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedNotes != (task.notes ?? "") {
            appState.updateTaskNotes(task.id, notes: trimmedNotes)
        }
    }
}

#Preview {
    TaskDetailView(
        task: Task(title: "Complete project proposal", type: .signal, notes: "Include budget estimates")
    )
    .environmentObject(AppState())
}
