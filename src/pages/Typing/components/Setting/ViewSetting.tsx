import styles from './index.module.css'
import { defaultFontSizeConfig, foreignFontFamilyOptions, translateFontFamilyOptions } from '@/constants'
import { fontSizeConfigAtom } from '@/store'
import { Listbox, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { Fragment, useCallback, useMemo } from 'react'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)

  const onChangeForeignFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        foreignFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onChangeTranslateFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        translateFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onChangeForeignFontFamily = useCallback(
    (value: string) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        foreignFontFamily: value,
      }))
    },
    [setFontsizeConfig],
  )

  const onChangeTranslateFontFamily = useCallback(
    (value: string) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        translateFontFamily: value,
      }))
    },
    [setFontsizeConfig],
  )

  const onResetFontSize = useCallback(() => {
    setFontsizeConfig({ ...defaultFontSizeConfig })
  }, [setFontsizeConfig])

  const selectedForeignFontFamily = useMemo(
    () => foreignFontFamilyOptions.find((option) => option.value === fontSizeConfig.foreignFontFamily) ?? foreignFontFamilyOptions[0],
    [fontSizeConfig.foreignFontFamily],
  )
  const selectedTranslateFontFamily = useMemo(
    () => translateFontFamilyOptions.find((option) => option.value === fontSizeConfig.translateFontFamily) ?? translateFontFamilyOptions[0],
    [fontSizeConfig.translateFontFamily],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>字体设置</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>英文字号</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.foreignFont]}
                  min={20}
                  max={96}
                  step={4}
                  className="slider"
                  onValueChange={onChangeForeignFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.foreignFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>英文字体</span>
              <Listbox value={fontSizeConfig.foreignFontFamily} onChange={onChangeForeignFontFamily}>
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span style={{ fontFamily: selectedForeignFontFamily.value }}>{selectedForeignFontFamily.name}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {foreignFontFamilyOptions.map((option) => (
                        <Listbox.Option key={option.name} value={option.value}>
                          {({ selected }) => (
                            <>
                              <span style={{ fontFamily: option.value }}>{option.name}</span>
                              {selected && (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>中文字号</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.translateFont]}
                  max={60}
                  min={14}
                  step={4}
                  className="slider"
                  onValueChange={onChangeTranslateFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.translateFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>中文字体</span>
              <Listbox value={fontSizeConfig.translateFontFamily} onChange={onChangeTranslateFontFamily}>
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span style={{ fontFamily: selectedTranslateFontFamily.value }}>{selectedTranslateFontFamily.name}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {translateFontFamilyOptions.map((option) => (
                        <Listbox.Option key={option.name} value={option.value}>
                          {({ selected }) => (
                            <>
                              <span style={{ fontFamily: option.value }}>{option.name}</span>
                              {selected && (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <button className="my-btn-primary ml-4 disabled:bg-gray-300" type="button" onClick={onResetFontSize} title="重置字体设置">
            重置字体设置
          </button>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
