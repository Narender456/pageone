"use client"

import * as Switch from "@radix-ui/react-switch"
import { useState } from "react"

export default function RadixSwitchExample() {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm" htmlFor="radix-switch">
        Enable Notifications
      </label>

      <Switch.Root
        id="radix-switch"
        className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-green-500 outline-none cursor-pointer transition-colors"
        checked={enabled}
        onCheckedChange={setEnabled}
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </div>
  )
}
