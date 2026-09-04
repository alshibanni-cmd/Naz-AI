import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SETTINGS, Settings } from '@/types/settings.types';

let settingsStore: Settings = { ...DEFAULT_SETTINGS };
let settingsHistory: Array<{
  timestamp: string;
  action: string;
  key?: string;
  value?: any;
  scope?: string;
}> = [];

export async function GET() {
  try {
    return NextResponse.json({
      settings: settingsStore,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;
    if (!settings) {
      return NextResponse.json(
        { error: 'البيانات غير مكتملة' },
        { status: 400 }
      );
    }
    if (typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'تنسيق البيانات غير صحيح' },
        { status: 400 }
      );
    }
    settingsStore = { ...settingsStore, ...settings };
    settingsHistory.push({
      timestamp: new Date().toISOString(),
      action: 'save_all',
      value: settings,
    });
    return NextResponse.json({
      success: true,
      settings: settingsStore,
      message: 'تم حفظ الإعدادات بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, scope } = body;
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }
    if (!(key in settingsStore)) {
      return NextResponse.json(
        { error: `الإعداد ${key} غير موجود` },
        { status: 404 }
      );
    }
    settingsStore = { ...settingsStore, [key]: value };
    settingsHistory.push({
      timestamp: new Date().toISOString(),
      action: 'update',
      key,
      value,
      scope: scope || 'global',
    });
    return NextResponse.json({
      success: true,
      setting: { key, value, scope: scope || 'global' },
      message: `تم تحديث ${key} بنجاح`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل تحديث الإعداد' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    settingsStore = { ...DEFAULT_SETTINGS };
    settingsHistory.push({
      timestamp: new Date().toISOString(),
      action: 'reset',
    });
    return NextResponse.json({
      success: true,
      settings: settingsStore,
      message: 'تم إعادة ضبط الإعدادات إلى القيم الافتراضية',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل إعادة ضبط الإعدادات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, settings } = body;
    if (settings) {
      settingsStore = { ...settingsStore, ...settings };
      settingsHistory.push({
        timestamp: new Date().toISOString(),
        action: 'apply_all',
        value: settings,
      });
      return NextResponse.json({
        success: true,
        message: 'تم تطبيق جميع الإعدادات على Naz AI Runtime',
        applied: settings,
      });
    }
    if (key && value !== undefined) {
      if (!(key in settingsStore)) {
        return NextResponse.json(
          { error: `الإعداد ${key} غير موجود` },
          { status: 404 }
        );
      }
      settingsStore = { ...settingsStore, [key]: value };
      settingsHistory.push({
        timestamp: new Date().toISOString(),
        action: 'apply',
        key,
        value,
      });
      return NextResponse.json({
        success: true,
        message: `تم تطبيق ${key} = ${value} على Naz AI Runtime`,
        applied: { key, value },
      });
    }
    return NextResponse.json(
      { error: 'بيانات غير مكتملة' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل تطبيق الإعدادات' },
      { status: 500 }
    );
  }
}
