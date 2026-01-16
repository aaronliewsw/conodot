import SwiftUI

struct LogoView: View {
    var onTap: (() -> Void)? = nil

    var body: some View {
        Button(action: { onTap?() }) {
            HStack(spacing: 8) {
                // Logo icon (simplified cat silhouette)
                Circle()
                    .fill(Theme.chestnut)
                    .frame(width: 32, height: 32)
                    .overlay(
                        Image(systemName: "pawprint.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Theme.dustGrey)
                    )

                Text("conodot")
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                    .foregroundColor(Theme.chestnut)
            }
        }
        .buttonStyle(.plain)
        .disabled(onTap == nil)
    }
}

#Preview {
    LogoView()
        .padding()
        .background(Theme.dustGrey)
}
