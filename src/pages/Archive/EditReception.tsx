import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import {
  getReceptionById,
  updateReceptionItem,
  deleteReceptionItem,
  addReceptionItem,
} from '../../services/receptionService'
import { ArrowLeft, Save, Trash2, Plus, AlertCircle } from 'lucide-react'

interface ReceptionItem {
  id: string
  item_description: string
  work_group: string
  transaction_type: string
  quantity: number
  price: number
  upd_document_id: string | null
}

interface AcceptedMotor {
  id: string
  position_in_reception: number
  motor_service_description: string
  motor_inventory_number: string
  subdivision_id: string
  subdivisions: {
    id: string
    name: string
  }
  items: ReceptionItem[]
}

interface Reception {
  id: string
  reception_number: string
  reception_date: string
  counterparty_id: string
  counterparties: {
    id: string
    name: string
  }
  motors: AcceptedMotor[]
}

export const EditReception: React.FC = () => {
  const { receptionId } = useParams<{ receptionId: string }>()
  const navigate = useNavigate()
  const [reception, setReception] = useState<Reception | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItems, setEditingItems] = useState<Record<string, ReceptionItem>>({})
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set())
  const [newItems, setNewItems] = useState<Record<string, Partial<ReceptionItem>>>({})

  useEffect(() => {
    loadReception()
  }, [receptionId])

  const loadReception = async () => {
    if (!receptionId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getReceptionById(receptionId)
      setReception(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приемки')
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (itemId: string, field: keyof ReceptionItem, value: string | number) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  const handleSaveItem = async (itemId: string) => {
    const updates = editingItems[itemId]
    if (!updates) return

    try {
      setSavingItems((prev) => new Set(prev).add(itemId))
      await updateReceptionItem(itemId, updates)
      setEditingItems((prev) => {
        const newEditing = { ...prev }
        delete newEditing[itemId]
        return newEditing
      })
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSavingItems((prev) => {
        const newSaving = new Set(prev)
        newSaving.delete(itemId)
        return newSaving
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return

    try {
      await deleteReceptionItem(itemId)
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
    }
  }

  const handleNewItemChange = (motorId: string, field: keyof ReceptionItem, value: string | number) => {
    setNewItems((prev) => ({
      ...prev,
      [motorId]: {
        ...prev[motorId],
        [field]: value,
      },
    }))
  }

  const handleAddItem = async (motorId: string) => {
    const newItem = newItems[motorId]
    if (!newItem?.item_description || !newItem?.work_group || !newItem?.transaction_type) {
      setError('Заполните все обязательные поля')
      return
    }

    try {
      await addReceptionItem(motorId, {
        item_description: newItem.item_description as string,
        work_group: newItem.work_group as string,
        transaction_type: newItem.transaction_type as string,
        quantity: newItem.quantity || 1,
        price: newItem.price || 0,
      })
      setNewItems((prev) => {
        const updated = { ...prev }
        delete updated[motorId]
        return updated
      })
      await loadReception()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления позиции')
    }
  }

  const getItemValue = (item: ReceptionItem, field: keyof ReceptionItem) => {
    if (editingItems[item.id]?.[field] !== undefined) {
      return editingItems[item.id][field]
    }
    return item[field]
  }

  if (loading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка приемки...</div>
        </div>
      </AppLayout>
    )
  }

  if (!reception) {
    return (
      <AppLayout title="Ошибка">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Приемка не найдена</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`Редактирование приемки ${reception.reception_number}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/app/archive')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Информация о приемке</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер приемки</label>
              <div className="text-gray-900">{reception.reception_number}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата приемки</label>
              <div className="text-gray-900">
                {new Date(reception.reception_date).toLocaleDateString('ru-RU')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Контрагент</label>
              <div className="text-gray-900">{reception.counterparties.name}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Двигатели ({reception.motors.length})</h2>

          {reception.motors.map((motor) => (
            <div key={motor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold mr-3">
                      {motor.position_in_reception}
                    </span>
                    <span className="font-semibold text-gray-900">{motor.motor_service_description}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Подразделение: {motor.subdivisions.name}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Работы ({motor.items.length})</h3>

                <div className="space-y-2">
                  {motor.items.map((item) => {
                    const isLinked = !!item.upd_document_id
                    const isEditing = editingItems[item.id] !== undefined
                    const isSaving = savingItems.has(item.id)

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 gap-2 p-3 rounded-lg border ${
                          isLinked ? 'bg-gray-50 border-gray-300' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="col-span-4">
                          <Input
                            value={getItemValue(item, 'item_description') as string}
                            onChange={(e) => handleEditItem(item.id, 'item_description', e.target.value)}
                            disabled={isLinked}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={getItemValue(item, 'work_group') as string}
                            onChange={(e) => handleEditItem(item.id, 'work_group', e.target.value)}
                            disabled={isLinked}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={getItemValue(item, 'transaction_type') as string}
                            onChange={(e) => handleEditItem(item.id, 'transaction_type', e.target.value)}
                            disabled={isLinked}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={getItemValue(item, 'quantity') as number}
                            onChange={(e) => handleEditItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            disabled={isLinked}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={getItemValue(item, 'price') as number}
                            onChange={(e) => handleEditItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            disabled={isLinked}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-1 flex gap-1">
                          {!isLinked && (
                            <>
                              {isEditing && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveItem(item.id)}
                                  disabled={isSaving}
                                  className="h-9 w-9 p-0"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {isLinked && (
                            <div className="flex items-center text-xs text-gray-500">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              В УПД
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <Input
                        placeholder="Описание работы"
                        value={(newItems[motor.id]?.item_description as string) || ''}
                        onChange={(e) => handleNewItemChange(motor.id, 'item_description', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Группа работ"
                        value={(newItems[motor.id]?.work_group as string) || ''}
                        onChange={(e) => handleNewItemChange(motor.id, 'work_group', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Тип операции"
                        value={(newItems[motor.id]?.transaction_type as string) || ''}
                        onChange={(e) => handleNewItemChange(motor.id, 'transaction_type', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="Кол-во"
                        value={(newItems[motor.id]?.quantity as number) || 1}
                        onChange={(e) => handleNewItemChange(motor.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Цена"
                        value={(newItems[motor.id]?.price as number) || 0}
                        onChange={(e) => handleNewItemChange(motor.id, 'price', parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(motor.id)}
                        className="h-9 w-full"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
